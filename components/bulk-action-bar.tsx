'use client';
import { type ReactNode, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface BulkAction {
  key: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  confirm?: {
    title: string;
    description: string;
    icon?: ReactNode;
  };
  onClick: () => Promise<void> | void;
}

interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClearSelection: () => void;
  extra?: ReactNode;
}

export function BulkActionBar({
  selectedCount,
  actions,
  onClearSelection,
  extra,
}: BulkActionBarProps) {
  const [loading, setLoading] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<BulkAction | null>(null);

  if (selectedCount === 0) return null;

  async function run(action: BulkAction) {
    setLoading(true);
    try {
      await action.onClick();
    } finally {
      setLoading(false);
    }
  }

  function handleClick(action: BulkAction) {
    if (action.confirm) setPendingConfirm(action);
    else void run(action);
  }

  return (
    <>
      <div
        role="toolbar"
        aria-label="Bulk actions"
        aria-orientation="horizontal"
        className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-row items-center gap-2 rounded-lg border bg-card px-2 py-1.5 shadow-lg outline-none animate-in fade-in-0 zoom-in-95 duration-200 [animation-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
      >
        <div className="flex items-center gap-1 rounded-sm border px-2 py-1 text-sm font-medium tabular-nums">
          <span>{selectedCount}</span>
          <span className="text-muted-foreground">đã chọn</span>
          <div className="ml-0.5 h-4 w-px bg-border" />
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Bỏ chọn tất cả"
            className="rounded opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="h-6 w-px bg-border" />

        <div role="group" className="flex items-center gap-1.5">
          {actions.map((action) =>
            action.destructive ? (
              <Button
                key={action.key}
                size="sm"
                disabled={loading}
                onClick={() => handleClick(action)}
                className="h-8 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {action.icon}
                {action.label}
              </Button>
            ) : (
              <Button
                key={action.key}
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={() => handleClick(action)}
                className="h-8 gap-1.5"
              >
                {action.icon}
                {action.label}
              </Button>
            ),
          )}

          {extra && (
            <>
              <div className="h-6 w-px bg-border" />
              {extra}
            </>
          )}
        </div>
      </div>

      {pendingConfirm && (
        <AlertDialog open onOpenChange={(v) => !v && setPendingConfirm(null)}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              {pendingConfirm.confirm!.icon && (
                <AlertDialogMedia
                  className={
                    pendingConfirm.destructive
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-muted text-foreground'
                  }
                >
                  {pendingConfirm.confirm!.icon}
                </AlertDialogMedia>
              )}
              <AlertDialogTitle>{pendingConfirm.confirm!.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {pendingConfirm.confirm!.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingConfirm(null)}>Hủy</AlertDialogCancel>
              <AlertDialogAction
                variant={pendingConfirm.destructive ? 'destructive' : 'default'}
                className={
                  pendingConfirm.destructive
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : undefined
                }
                disabled={loading}
                onClick={async () => {
                  await run(pendingConfirm);
                  setPendingConfirm(null);
                }}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
