import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Event } from '@/types';

export function EventCard({ event }: { event: Event }) {
  const statusColor =
    event.status === 'PUBLISHED'
      ? 'text-emerald-600'
      : event.status === 'CANCELLED'
      ? 'text-rose-600'
      : 'text-amber-600';

  return (
    <Card className="hover:shadow-md transition-shadow duration-150">
      <CardHeader>
        <div>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription>
            {new Date(event.date).toLocaleDateString()} · {event.location}
          </CardDescription>
        </div>
        <div className="text-sm font-semibold uppercase tracking-[0.18em]">
          <span className={statusColor}>{event.status}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          {event.description || 'No description provided.'}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Capacity: {event.capacity}</p>
          <p>Price: {event.price.toLocaleString()} VND</p>
        </div>
        <Link href={`/events/${event.id}`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">View details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
