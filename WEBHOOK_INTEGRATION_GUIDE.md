# Webhook Integration Guide for External Applications

## Overview

**No changes needed in your external applications!** The webhook system works automatically on the backend.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  Your External Application (Any App)                        │
│  - React App                                                │
│  - Mobile App (iOS/Android)                                 │
│  - Desktop App                                              │
│  - Microservice                                             │
│  - Third-party Integration                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ POST /api/auth/login
                       │ { email, phone, password }
                       │ (No webhook code needed!)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  IACP Backend (http://localhost:4501)                       │
│                                                              │
│  1. Validates credentials                                   │
│  2. Generates JWT token                                     │
│  3. ✅ AUTOMATICALLY triggers webhooks                      │
│     (This happens server-side, transparent to caller)       │
│  4. Returns token + user info                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP POST (async, non-blocking)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Your Webhook Endpoints                                     │
│  - Analytics service                                        │
│  - Audit logging service                                    │
│  - Notification service                                     │
│  - Session management service                               │
└─────────────────────────────────────────────────────────────┘
```

## What External Applications Need to Do

### ✅ Just Call the Login Endpoint (That's It!)

Your external application only needs to call the standard login endpoint:

```javascript
// React/JavaScript Example
const response = await fetch('http://your-server:4501/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    phone: '1234567890',
    password: 'password123'
  })
});

const data = await response.json();
// ✅ Webhooks have already been triggered automatically!
// You get: { token, user, applications }
```

```python
# Python Example
import requests

response = requests.post(
    'http://your-server:4501/api/auth/login',
    json={
        'email': 'user@example.com',
        'phone': '1234567890',
        'password': 'password123'
    }
)

data = response.json()
# ✅ Webhooks have already been triggered automatically!
```

```java
// Java Example
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://your-server:4501/api/auth/login"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\"email\":\"user@example.com\",\"phone\":\"1234567890\",\"password\":\"password123\"}"
    ))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
// ✅ Webhooks have already been triggered automatically!
```

## What You DON'T Need to Do

❌ **Don't add webhook code to your external applications**
❌ **Don't modify the login request**
❌ **Don't handle webhook responses in your app**
❌ **Don't configure webhook URLs in your app**

## Webhook Configuration (Backend Only)

Webhooks are configured **only in the IACP backend**, not in external applications:

### 1. Create Webhooks (Backend Admin/API)

```bash
POST http://your-server:4501/api/webhooks
{
  "url": "https://your-analytics-service.com/webhook",
  "eventType": "login",
  "isActive": true
}
```

### 2. Webhooks Trigger Automatically

Once configured, webhooks trigger automatically for:
- ✅ All successful logins (from any application)
- ✅ All successful logouts (from any application)
- ✅ No code changes needed in external apps

## Webhook Payload

When a user logs in from any application, your webhook endpoints receive:

```json
{
  "event": "login",
  "timestamp": "2024-01-24T10:30:00.000Z",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "1234567890"
  },
  "application": {
    "id": 1,
    "appName": "MyApp"
  }
}
```

## Use Cases

### 1. Analytics Tracking
- Track user logins across all applications
- No need to add tracking code to each app
- Centralized login analytics

### 2. Audit Logging
- Log all authentication events
- Compliance and security auditing
- Single source of truth

### 3. Session Management
- Sync sessions across multiple applications
- Centralized session tracking
- Cross-app session management

### 4. Notifications
- Send alerts on login events
- Security notifications
- User activity notifications

### 5. Real-time Updates
- Update dashboards in real-time
- Live user activity feeds
- Real-time monitoring

## Example: Multiple Applications

```
Application A (React Web App)
    │
    ├─► POST /api/auth/login
    │
Application B (Mobile App)
    │
    ├─► POST /api/auth/login
    │
Application C (Desktop App)
    │
    └─► POST /api/auth/login
            │
            ▼
    ┌───────────────────────┐
    │  IACP Backend         │
    │  (Triggers webhooks)  │
    └───────────┬───────────┘
                │
                ├─► Analytics Service
                ├─► Audit Log Service
                └─► Notification Service
```

**All applications work the same way - just call the login endpoint!**

## Testing from External Applications

### Test from Any Application

```bash
# From command line
curl -X POST http://your-server:4501/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'

# ✅ Webhook triggers automatically!
```

### Verify Webhook Triggered

1. Check backend logs:
   ```
   [Webhook] Triggering login webhooks for user: 1
   [Webhook] Found 1 active webhook(s) for login
   [Webhook] Triggering webhook 1 to https://...
   ```

2. Check your webhook endpoint:
   - Should receive POST request with user data
   - Check webhook.site if using it for testing

## Summary

✅ **External applications:** Just call `/api/auth/login` - no changes needed!
✅ **Webhook configuration:** Done in IACP backend only
✅ **Webhook triggering:** Automatic and transparent
✅ **No code changes:** Required in external applications

The webhook system is designed to work seamlessly with any application that uses your authentication API!

