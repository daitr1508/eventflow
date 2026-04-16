import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsServiceService {
  private readonly logger = new Logger(NotificationsServiceService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendWelcomeEmail(data: {
    userId: string;
    email: string;
    name: string;
    verificationToken: string;
    expiresAt: string;
  }) {
    this.logger.log(`Sending welcome email to ${data.email}`);

    const html = `
      <h1>Xin chào, ${data.name}! 🎉</h1>
      <p>Bạn cần xác minh email để hoàn tất quá trình đăng ký.</p>
      <p>Vui lòng click vào link sau:</p>
      <p>Link sẽ hết hạn vào ${new Date(data.expiresAt).toLocaleString()}</p>
      <a href="https://eventflow.com/verify-email?token=${data.verificationToken}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác minh email</a>
    `;

    await this.emailService.sendEmail(
      data.email,
      'Welcome to EventFlow!',
      html,
    );
  }

  async sendTicketPurchasedEmail(data: {
    userId: string;
    email?: string;
    ticketCode: string;
    eventTitle?: string;
    quantity: number;
    totalPrice: number;
  }) {
    const email = data.email || 'user@example.com'; // Fallback for demo
    this.logger.log(`Sending ticket confirmation to ${email}`);

    const html = `
      <h1>Ticket Confirmed! 🎟️</h1>
      <p>Your ticket purchase was successful.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Event:</strong> ${data.eventTitle || 'Your Event'}</p>
        <p><strong>Ticket Code:</strong> ${data.ticketCode}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Total:</strong> $${(data.totalPrice / 100).toFixed(2)}</p>
      </div>
      <p>Show this ticket code at the event entrance.</p>
    `;

    await this.emailService.sendEmail(email, 'Your Ticket is Confirmed!', html);
  }

  async sendTicketCancelledEmail(data: {
    ticketId: string;
    userId: string;
    email?: string;
  }) {
    const email = data.email || 'user@example.com';
    this.logger.log(`Sending cancellation notice to ${email}`);

    const html = `
      <h1>Ticket Cancelled</h1>
      <p>Your ticket has been cancelled as requested.</p>
      <p>If you did not request this cancellation, please contact support.</p>
    `;

    await this.emailService.sendEmail(email, 'Ticket Cancelled', html);
  }

  sendEventCancelledEmail(data: {
    eventId: string;
    eventTitle?: string;
    organizerId: string;
  }) {
    this.logger.log(`Sending event cancellation notice to ${data.organizerId}`);
  }
}
