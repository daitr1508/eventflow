import { apiClient } from '@/lib/api-client';
import type { Event } from '@/types';

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
}

export async function getEvents(): Promise<Event[]> {
  return apiClient.get<Event[]>('/events');
}

export async function getEvent(id: string): Promise<Event> {
  return apiClient.get<Event>(`/events/${id}`);
}

export async function getMyEvents(): Promise<Event[]> {
  return apiClient.get<Event[]>('/events/my-events');
}

export async function createEvent(data: CreateEventInput): Promise<Event> {
  return apiClient.post<Event>('/events', data);
}

export async function publishEvent(id: string) {
  return apiClient.post(`/events/${id}/publish`);
}

export async function cancelEvent(id: string) {
  return apiClient.post(`/events/${id}/cancel`);
}
