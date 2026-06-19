'use client';

import { AlertCircleIcon, RefreshCwIcon, XCircleIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { progressSteps, toneBg } from '../order-display';

export function OrderPipeline({ progress }: { progress: number }) {
  return (
    <div className="grid gap-3">
      <div className="hidden grid-cols-[auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto] items-center gap-x-3 md:grid">
        {progressSteps.map((step, i) => {
          const active = i < progress;
          const complete = i < progress - 1;
          const Icon = step.icon;
          return (
            <div key={step.label} className="contents">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-md border bg-background',
                  active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
              </div>
              {i < progressSteps.length - 1 && (
                <div className="h-1 rounded-full bg-border/70">
                  <div className={cn('h-full rounded-full transition-all', complete && 'bg-foreground')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hidden grid-cols-[auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto] gap-x-3 text-[11px] font-medium text-muted-foreground md:grid">
        {progressSteps.map((step, i) => (
          <div key={step.label} className="contents">
            <span>{step.label}</span>
            {i < progressSteps.length - 1 && <span aria-hidden />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {progressSteps.map((step, i) => {
          const active = i < progress;
          const complete = i < progress - 1;
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <div
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-md border',
                    active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground',
                  )}
                >
                  <Icon className="size-2.5" />
                </div>
                {i < progressSteps.length - 1 && (
                  <div className="h-1 flex-1 rounded-full bg-border/70">
                    <div className={cn('h-full rounded-full', complete && 'bg-foreground')} />
                  </div>
                )}
              </div>
              <span className="truncate text-[11px] leading-none text-muted-foreground">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OrderCalloutBanner({ tone, title, text }: { tone: string; title: string; text: string }) {
  return (
    <Alert className={cn('flex items-start gap-3 rounded-xl p-5', toneBg(tone))}>
      {tone === 'danger' ? (
        <XCircleIcon className="mt-0.5 size-5 shrink-0" />
      ) : tone === 'warning' ? (
        <RefreshCwIcon className="mt-0.5 size-5 shrink-0" />
      ) : (
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
      )}
      <div>
        <AlertTitle className="text-sm font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-0.5 text-sm opacity-80">{text}</AlertDescription>
      </div>
    </Alert>
  );
}

export function DetailSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">
      <section className="shrink-0 border-b border-dashed border-border/70 pb-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="grid gap-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
        </div>
      </section>
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
