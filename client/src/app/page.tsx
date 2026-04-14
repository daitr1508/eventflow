import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-900 px-8 py-14 shadow-lg shadow-zinc-950/40">
          <div className="max-w-3xl space-y-6">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">EventFlow</p>
            <h1 className="text-5xl font-semibold tracking-tight">Event marketplace for organizers and attendees.</h1>
            <p className="max-w-2xl text-base leading-8 text-zinc-400">
              Explore events, create new ones, and manage tickets in a single dashboard. This UI connects directly to the app gateway APIs defined in the backend services.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/events" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400">
                Browse events
              </Link>
              <Link href="/tickets" className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900">
                My tickets
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <Link href="/events/create" className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition hover:bg-zinc-800">
            <h2 className="text-xl font-semibold">Create event</h2>
            <p className="mt-3 text-sm text-zinc-400">Publish new event listings and invite your audience.</p>
          </Link>
          <Link href="/events" className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 transition hover:bg-zinc-800">
            <h2 className="text-xl font-semibold">Find events</h2>
            <p className="mt-3 text-sm text-zinc-400">Browse current public events and purchase tickets securely.</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
