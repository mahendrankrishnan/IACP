import { eq, and, or, isNull, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { webhooks, webhookEvents } from '../db/schema.js';
import type { Webhook, NewWebhook, NewWebhookEvent, WebhookEvent } from '../db/schema.js';
import crypto from 'crypto';

export type WebhookEventType = 'login' | 'logout';

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  source?: 'internal' | 'external';
  user: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  application?: {
    id: number;
    appName: string;
  };
  metadata?: Record<string, any>;
}

export class WebhookService {
  /**
   * Get all webhooks
   */
  async getAllWebhooks(): Promise<Webhook[]> {
    return await db.select().from(webhooks);
  }

  /**
   * Get webhook by ID
   */
  async getWebhookById(id: number): Promise<Webhook | null> {
    const result = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
    return result[0] || null;
  }

  /**
   * Get active webhooks for a specific event type
   * When appId is provided, returns webhooks for that app AND global webhooks (appId is null)
   * When appId is not provided, returns only global webhooks (appId is null)
   */
  async getActiveWebhooksByEventType(eventType: WebhookEventType, appId?: number): Promise<Webhook[]> {
    const baseConditions = [
      eq(webhooks.eventType, eventType),
      eq(webhooks.isActive, true),
    ];

    if (appId) {
      // Get webhooks for this specific app OR global webhooks (appId is null)
      return await db
        .select()
        .from(webhooks)
        .where(and(...baseConditions, or(eq(webhooks.appId, appId), isNull(webhooks.appId))));
    } else {
      // Get only global webhooks (appId is null)
      return await db
        .select()
        .from(webhooks)
        .where(and(...baseConditions, isNull(webhooks.appId)));
    }
  }

  /**
   * Create a new webhook
   */
  async createWebhook(data: Omit<NewWebhook, 'id' | 'createdAt' | 'updatedAt'>): Promise<Webhook> {
    const result = await db
      .insert(webhooks)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  /**
   * Update a webhook
   */
  async updateWebhook(id: number, data: Partial<Omit<NewWebhook, 'id' | 'createdAt'>>): Promise<Webhook | null> {
    const result = await db
      .update(webhooks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(webhooks.id, id))
      .returning();
    return result[0] || null;
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: number): Promise<boolean> {
    const result = await db.delete(webhooks).where(eq(webhooks.id, id)).returning();
    return result.length > 0;
  }

  /**
   * Log webhook event to database
   */
  async logWebhookEvent(event: Omit<NewWebhookEvent, 'id' | 'triggeredAt'>): Promise<void> {
    await db.insert(webhookEvents).values({
      ...event,
      triggeredAt: new Date(),
    });
  }

  /**
   * Get webhook events (for audit/logging)
   */
  async getWebhookEvents(filters?: {
    webhookId?: number;
    eventType?: WebhookEventType;
    userId?: number;
    status?: 'success' | 'failed';
    limit?: number;
  }): Promise<WebhookEvent[]> {
    const conditions = [];
    if (filters?.webhookId) {
      conditions.push(eq(webhookEvents.webhookId, filters.webhookId));
    }
    if (filters?.eventType) {
      conditions.push(eq(webhookEvents.eventType, filters.eventType));
    }
    if (filters?.userId) {
      conditions.push(eq(webhookEvents.userId, filters.userId));
    }
    if (filters?.status) {
      conditions.push(eq(webhookEvents.status, filters.status));
    }

    const baseQuery = db.select().from(webhookEvents);
    const query = conditions.length > 0 
      ? baseQuery.where(and(...conditions))
      : baseQuery;

    const results = await query.orderBy(desc(webhookEvents.triggeredAt));
    return filters?.limit ? results.slice(0, filters.limit) : results;
  }

  /**
   * Sign webhook payload with secret using HMAC SHA256
   */
  signPayload(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Trigger webhooks for a specific event
   * This method sends HTTP POST requests to all active webhooks for the event type
   */
  async triggerWebhooks(
    eventType: WebhookEventType,
    payload: WebhookPayload,
    appId?: number
  ): Promise<void> {
    console.log(`[Webhook] Fetching active webhooks for event: ${eventType}, appId: ${appId || 'global'}`);
    const activeWebhooks = await this.getActiveWebhooksByEventType(eventType, appId);
    console.log(`[Webhook] Found ${activeWebhooks.length} active webhook(s) for ${eventType}`);
    
    if (activeWebhooks.length === 0) {
      console.log(`[Webhook] WARNING: No active webhooks found for ${eventType}. Webhook will not be sent.`);
      console.log(`[Webhook] To fix: Create a webhook with eventType='${eventType}' and isActive=true`);
    }

    // Trigger all webhooks asynchronously (fire and forget)
    const webhookPromises = activeWebhooks.map(async (webhook) => {
      const startTime = Date.now();
      let status = 'failed';
      let statusCode: number | null = null;
      let errorMessage: string | null = null;
      let responseTime: number | null = null;

      try {
        console.log(`[Webhook] Triggering webhook ${webhook.id} to ${webhook.url}`);
        const payloadString = JSON.stringify(payload);
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'IACP-Webhook/1.0',
        };

        // Add signature if secret is provided
        if (webhook.secret) {
          const signature = this.signPayload(payloadString, webhook.secret);
          headers['X-Webhook-Signature'] = `sha256=${signature}`;
        }

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: payloadString,
          // Timeout after 10 seconds
          signal: AbortSignal.timeout(10000),
        });

        responseTime = Date.now() - startTime;
        statusCode = response.status;

        if (!response.ok) {
          status = 'failed';
          errorMessage = `HTTP ${response.status}`;
          console.error(
            `Webhook ${webhook.id} (${webhook.url}) failed with status ${response.status}`
          );
        } else {
          status = 'success';
          console.log(`Webhook ${webhook.id} (${webhook.url}) triggered successfully`);
        }
      } catch (error: any) {
        responseTime = Date.now() - startTime;
        status = 'failed';
        errorMessage = error.message || 'Unknown error';
        // Log error but don't throw - webhook failures shouldn't break the main flow
        console.error(
          `Error triggering webhook ${webhook.id} (${webhook.url}):`,
          error.message
        );
      } finally {
        // Log webhook event to database
        try {
          await this.logWebhookEvent({
            webhookId: webhook.id,
            eventType: eventType,
            userId: payload.user?.id || null,
            appId: appId || webhook.appId || null,
            status: status as 'success' | 'failed',
            statusCode: statusCode,
            responseTime: responseTime,
            errorMessage: errorMessage,
            payload: JSON.stringify(payload).substring(0, 5000), // Limit payload size
          });
        } catch (logError: any) {
          // Don't fail webhook delivery if logging fails
          console.error('[Webhook] Failed to log webhook event:', logError.message);
        }
      }
    });

    // Wait for all webhooks to complete (but don't fail if some fail)
    await Promise.allSettled(webhookPromises);
  }
}

