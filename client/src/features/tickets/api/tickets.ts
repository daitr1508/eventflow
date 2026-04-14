import { apiClient } from '@/lib/api-client';
import type { Ticket } from '@/types';

export interface PurchaseTicketInput {
  eventId: string;
  quantity: number;
}

export interface TicketWithEvent extends Ticket {
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
  totalPrice?: number;
}

export async function purchaseTicket(data: PurchaseTicketInput): Promise<{ message: string; ticket: TicketWithEvent }> {
  return apiClient.post('/tickets/purchase', data);
}

export async function getMyTickets(): Promise<TicketWithEvent[]> {
  return apiClient.get<TicketWithEvent[]>('/tickets/my-tickets');
}

export async function getTicket(id: string): Promise<TicketWithEvent> {
  return apiClient.get<TicketWithEvent>(`/tickets/${id}`);
}
