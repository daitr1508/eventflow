'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createEvent,
  getEvent,
  getEvents,
  getMyEvents,
  publishEvent,
  cancelEvent,
  type CreateEventInput,
} from '../api/events';

export function useEvents() {
  return useQuery(['events'], getEvents);
}

export function useEvent(id: string) {
  return useQuery(['events', id], () => getEvent(id), {
    enabled: Boolean(id),
  });
}

export function useMyEvents() {
  return useQuery(['events', 'my-events'], getMyEvents, {
    enabled: typeof window !== 'undefined',
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event created successfully');
      router.push('/events');
    },
    onError: (error: Error) => {
      toast.error('Unable to create event', {
        description: error.message || 'Please check your data and try again.',
      });
    },
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event published');
    },
    onError: (error: Error) => {
      toast.error('Publish failed', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}

export function useCancelEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event cancelled');
    },
    onError: (error: Error) => {
      toast.error('Cancel failed', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}
