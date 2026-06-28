import { ShoppingCartIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-3 overflow-hidden">
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-2.5 lg:flex-row lg:items-center lg:justify-between 2xl:pb-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <ShoppingCartIcon />
          </div>
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-4 w-96 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </section>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row 2xl:gap-4 min-[1800px]:gap-5">
        <aside className="min-h-0 w-full shrink-0 p-1 pb-2 lg:w-56 xl:w-60 2xl:w-65 min-[1800px]:w-72">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </aside>

        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <section className="shrink-0 border-b border-dashed border-border/70 bg-background pb-2.5 pt-1 2xl:pb-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between 2xl:gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-28 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
                <Skeleton className="mt-2 h-4 w-96 max-w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-48 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            </div>
          </section>

          <div className="mt-2.5 grid gap-2.5 2xl:mt-3 2xl:gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="rounded-xl border bg-card p-3 2xl:p-4">
                <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-24 rounded-md" />
                    </div>
                    <Skeleton className="mt-3 h-5 w-64" />
                    <Skeleton className="mt-2 h-4 w-80 max-w-full" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <Skeleton className="mt-3 h-28 rounded-xl" />
              </article>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
