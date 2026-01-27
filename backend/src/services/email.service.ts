import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Check if email is enabled
    const emailEnabled = process.env.EMAIL_ENABLED === 'true';
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!emailEnabled || !smtpHost || !smtpUser || !smtpPassword) {
      console.warn('Email service is disabled or not configured. Set EMAIL_ENABLED=true and SMTP_* variables to enable.');
      this.isEnabled = false;
      return;
    }

    // Create transporter
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587'),
      secure: smtpPort === '465', // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Gmail-specific settings
      ...(smtpHost.includes('gmail') && {
        service: 'gmail',
      }),
    });

    this.isEnabled = true;
    console.log('Email service initialized with:', {
      host: smtpHost,
      port: smtpPort || '587',
      from: smtpFrom,
      enabled: true,
    });
  }

  /**
   * Send an email
   * @param options Email options (to, subject, html, text)
   * @returns Promise<boolean> - true if sent successfully, false otherwise
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      console.warn('Email service is not enabled. Email not sent to:', options.to);
      return false;
    }

    try {
      const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@iacp.com';
      
      const info = await this.transporter.sendMail({
        from: `"IACP" <${smtpFrom}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      });

      console.log('Email sent successfully:', {
        to: options.to,
        messageId: info.messageId,
      });
      return true;
    } catch (error: any) {
      console.error('Failed to send email:', {
        to: options.to,
        error: error.message,
      });
      return false;
    }
  }

  /**
   * Send welcome email to newly registered user
   * @param userEmail User's email address
   * @param username User's username
   * @returns Promise<boolean>
   */
  async sendWelcomeEmail(userEmail: string, username: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to IACP! 🎉</h1>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>Thank you for creating an account with <strong>IACP</strong> (Identity, Auth, Claim, Provider)!</p>
          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>Access all your assigned applications</li>
            <li>Manage your profile and settings</li>
            <li>Use secure authentication across all connected services</li>
          </ul>
          <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
          <p>Welcome aboard!</p>
          <p>Best regards,<br>The IACP Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} IACP. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to IACP - Your Account Has Been Created',
      html,
    });
  }

  /**
   * Send account creation notification (when admin creates user)
   * @param userEmail User's email address
   * @param username User's username
   * @param tempPassword Temporary password (if provided)
   * @returns Promise<boolean>
   */
  async sendAccountCreationEmail(
    userEmail: string,
    username: string,
    tempPassword?: string
  ): Promise<boolean> {
    const passwordInfo = tempPassword
      ? `
          <p><strong>Your account credentials:</strong></p>
          <ul>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          </ul>
          <p><strong>⚠️ Important:</strong> Please change your password after your first login.</p>
        `
      : `
          <p>Your account has been set up with the following details:</p>
          <ul>
            <li><strong>Username:</strong> ${username}</li>
            <li><strong>Email:</strong> ${userEmail}</li>
          </ul>
        `;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .credentials {
            background: #fff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your IACP Account Has Been Created</h1>
        </div>
        <div class="content">
          <h2>Hello ${username},</h2>
          <p>An administrator has created an account for you on <strong>IACP</strong> (Identity, Auth, Claim, Provider).</p>
          <div class="credentials">
            ${passwordInfo}
          </div>
          <p>You can now log in and start using the platform. If you have any questions, please contact your administrator.</p>
          <p>Best regards,<br>The IACP Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} IACP. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Your IACP Account Has Been Created',
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();

