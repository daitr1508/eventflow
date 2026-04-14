'use client';

import Link from 'next/link';
import { EventCard } from '@/features/events/components/event-card';
import { useEvents } from '@/features/events/hooks/use-events';

export default function EventsPage() {
  const { data: events = [], isLoading, isError } = useEvents();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Events</h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Browse public events and purchase tickets for the ones you like.
              </p>
            </div>
            <Link href="/events/create">
              <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">
                Create event
              </button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-16 text-center text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
            Loading events...
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-rose-300 bg-rose-50 p-8 text-rose-700 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-200">
            Unable to load events.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
