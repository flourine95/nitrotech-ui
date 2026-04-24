'use client';
import { RotateCcw, Trash2 } from 'lucide-react';
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
import type { Product } from '@/lib/api/products';

interface ProductDialogsProps {
  deleteTarget: Product | null;
  restoreTarget: Product | null;
  hardDeleteTarget: Product | null;
  deletePending: boolean;
  restorePending: boolean;
  hardDeletePending: boolean;
  onDeleteConfirm: () => void;
  onRestoreConfirm: () => void;
  onHardDeleteConfirm: () => void;
  onDeleteClose: () => void;
  onRestoreClose: () => void;
  onHardDeleteClose: () => void;
}

export function ProductDialogs({
  deleteTarget,
  restoreTarget,
  hardDeleteTarget,
  deletePending,
  restorePending,
  hardDeletePending,
  onDeleteConfirm,
  onRestoreConfirm,
  onHardDeleteConfirm,
  onDeleteClose,
  onRestoreClose,
  onHardDeleteClose,
}: ProductDialogsProps) {
  return (
    <>
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && onDeleteClose()}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-slate-900">{deleteTarget?.name}</strong>. Sản phẩm
              sẽ bị ẩn và có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={onDeleteConfirm}
              disabled={deletePending}
            >
              {deletePending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!restoreTarget} onOpenChange={(v) => !v && onRestoreClose()}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-100 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Khôi phục sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Khôi phục <strong className="text-slate-900">{restoreTarget?.name}</strong> về trạng
              thái hiển thị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={onRestoreConfirm} disabled={restorePending}>
              {restorePending ? 'Đang khôi phục...' : 'Khôi phục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!hardDeleteTarget} onOpenChange={(v) => !v && onHardDeleteClose()}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-slate-900">{hardDeleteTarget?.name}</strong> sẽ bị xóa hoàn
              toàn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={onHardDeleteConfirm}
              disabled={hardDeletePending}
            >
              {hardDeletePending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
