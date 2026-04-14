import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TicketWithEvent } from '../api/tickets';

export function TicketList({ tickets }: { tickets: TicketWithEvent[] }) {
  if (!tickets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        No purchased tickets yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-md transition-shadow duration-150">
          <CardHeader>
            <div>
              <CardTitle>{ticket.eventTitle || 'Ticket'}</CardTitle>
              <CardDescription>{ticket.eventLocation || 'Unknown location'}</CardDescription>
            </div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
              {ticket.status}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <p>Date: {ticket.eventDate ? new Date(ticket.eventDate).toLocaleString() : 'TBD'}</p>
              <p>Quantity: {ticket.quantity}</p>
              <p>Total: {ticket.totalPrice?.toLocaleString() || '0'} VND</p>
              <p>Code: {ticket.ticketCode}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Link href={`/events/${ticket.eventId}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">View event</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
