'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEvent } from '@/features/events/hooks/use-events';
import { usePurchaseTicket as useTicketPurchase } from '@/features/tickets/hooks/use-tickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PurchaseFormValues {
  quantity: number;
}

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: event, isLoading, isError } = useEvent(id);
  const purchaseMutation = useTicketPurchase();

  const form = useForm<PurchaseFormValues>({
    defaultValues: {
      quantity: 1,
    },
  });

  const remainingTickets = useMemo(() => {
    if (!event) return null;
    return event.capacity;
  }, [event]);

  const onSubmit = (values: PurchaseFormValues) => {
    purchaseMutation.mutate({ eventId: id, quantity: Number(values.quantity) });
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-4xl space-y-6">
        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Loading event details...
          </div>
        ) : isError || !event ? (
          <div className="rounded-3xl border border-rose-300 bg-rose-50 p-8 text-rose-700 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
            Event not found or an error occurred.
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col gap-3">
                <h1 className="text-3xl font-semibold">{event.title}</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{event.location} · {new Date(event.date).toLocaleString()}</p>
                <p className="text-zinc-700 dark:text-zinc-300">{event.description || 'No description available.'}</p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Capacity</p>
                  <p className="mt-1 text-xl font-semibold">{event.capacity}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-sm text-zinc-500">Price</p>
                  <p className="mt-1 text-xl font-semibold">{event.price.toLocaleString()} VND</p>
                </div>
              </div>
            </div>

            <Card className="rounded-3xl border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <div>
                  <CardTitle>Purchase tickets</CardTitle>
                  <CardDescription>Buy tickets for this event and keep your confirmation in your account.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-4"
                >
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200" htmlFor="quantity">
                      Quantity
                    </label>
                    <Input
                      id="quantity"
                      type="number"
                      min={1}
                      max={10}
                      {...form.register('quantity', { min: 1, max: 10, valueAsNumber: true })}
                      className="mt-2"
                    />
                  </div>
                  <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <p>Status: <span className="font-medium">{event.status}</span></p>
                    <p>Remaining seats: {remainingTickets ?? '—'}</p>
                  </div>
                  <Button type="submit" disabled={purchaseMutation.isLoading}>
                    {purchaseMutation.isLoading ? 'Purchasing...' : 'Purchase ticket'}
                  </Button>
                </form>
              </CardContent>
              {purchaseMutation.isError && (
                <CardFooter className="text-sm text-rose-600">Failed to purchase ticket.</CardFooter>
              )}
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
