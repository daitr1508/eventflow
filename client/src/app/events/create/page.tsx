'use client';

import { useForm } from 'react-hook-form';
import { useCreateEvent } from '@/features/events/hooks/use-events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CreateEventFormValues {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  price: number;
}

export default function CreateEventPage() {
  const { mutate: createEvent, isLoading } = useCreateEvent();
  const form = useForm<CreateEventFormValues>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 1,
      price: 0,
    },
  });

  const onSubmit = (values: CreateEventFormValues) => {
    createEvent({
      title: values.title,
      description: values.description,
      date: values.date,
      location: values.location,
      capacity: Number(values.capacity),
      price: Number(values.price),
    });
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-3xl font-semibold">Create a new event</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Add event details and publish it when you're ready.
          </p>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 grid gap-6"
          >
            <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Title
              <Input {...form.register('title', { required: true })} />
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Description
              <textarea
                {...form.register('description')}
                className="min-h-[120px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
              />
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Date
                <Input type="datetime-local" {...form.register('date', { required: true })} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Location
                <Input {...form.register('location', { required: true })} />
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Capacity
                <Input type="number" min={1} {...form.register('capacity', { valueAsNumber: true, min: 1 })} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Price
                <Input type="number" min={0} {...form.register('price', { valueAsNumber: true, min: 0 })} />
              </label>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Create event'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
