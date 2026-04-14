'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getMyTickets, getTicket, purchaseTicket, type PurchaseTicketInput } from '../api/tickets';

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'my-tickets'],
    queryFn: getMyTickets,
    enabled: typeof window !== 'undefined',
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: () => getTicket(id),
    enabled: Boolean(id),
  });
}

export function usePurchaseTicket() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: PurchaseTicketInput) => purchaseTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets', 'my-tickets']);
      toast.success('Ticket purchased successfully');
      router.push('/tickets');
    },
    onError: (error: Error) => {
      toast.error('Purchase failed', {
        description: error.message || 'Please try again later.',
      });
    },
  });
}
