import {
  Controller,
  Get,
  Logger,
  MessageEvent,
  Req,
  Sse,
} from '@nestjs/common';
import { NotificationsServiceService } from './notifications-service.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS } from '@app/kafka';
import { interval, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

@Controller()
export class NotificationsServiceController {
  private readonly logger = new Logger(NotificationsServiceController.name);

  constructor(
    private readonly notificationsServiceService: NotificationsServiceService,
  ) {}

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'notifications-service' };
  }

  @EventPattern(KAFKA_TOPICS.USER_REGISTERED)
  async handleUserRegistered(
    @Payload()
    data: {
      userId: string;
      email: string;
      name: string;
      verificationToken: string;
      expiresAt: string;
    },
  ) {
    this.logger.log(`Received user registered event: ${JSON.stringify(data)}`);
    await this.notificationsServiceService.sendWelcomeEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_PURCHASED)
  async handleTicketPurchased(
    @Payload()
    data: {
      ticketId: string;
      ticketCode: string;
      userId: string;
      quantity: number;
      totalPrice: number;
    },
  ) {
    this.logger.log(`Received ticket purchase event: ${JSON.stringify(data)}`);
    await this.notificationsServiceService.sendTicketPurchasedEmail(data);
  }

  @EventPattern(KAFKA_TOPICS.TICKET_CANCELLED)
  async handleTicketCancelled(
    @Payload() data: { ticketId: string; userId: string },
  ) {
    this.logger.log(
      `Received ticket cancellation event: ${JSON.stringify(data)}`,
    );
    await this.notificationsServiceService.sendTicketCancelledEmail(data);
  }

  // Test SSE
  @Get('sse')
  @Sse('timer')
  addTimer(@Req() request: any): Observable<MessageEvent> {
    let cleanup$ = new Subject<void>();
    const invrl = interval(1000).pipe(
      map(() => ({
        data: {
          time: new Date().toISOString(),
        },
        takeUntil: cleanup$,
        type: 'time-change',
      })),
      tap((data) => this.logger.log(`Emitting data: ${JSON.stringify(data)}`)),
    );

    request.on('close', () => {
      if (cleanup$) {
        this.logger.log('Client disconnected, cleaning up...');
        cleanup$.next();
        cleanup$.complete();
        (cleanup$ as any) = null; // Clear reference to allow GC
      }
    });

    return invrl;
  }
}
