'use client';
import { useState } from 'react';
import { Eye, EyeOff, RotateCcw, Trash2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

interface BulkBarProps {
  selectedCount: number;
  isDeleted: boolean;
  onClearSelection: () => void;
  onBulkShow: () => Promise<void>;
  onBulkHide: () => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onBulkRestore: () => Promise<void>;
  onBulkHardDelete: () => Promise<void>;
  onExportSelected: () => void;
}

export function ProductBulkBar({
  selectedCount,
  isDeleted,
  onClearSelection,
  onBulkShow,
  onBulkHide,
  onBulkDelete,
  onBulkRestore,
  onBulkHardDelete,
  onExportSelected,
}: BulkBarProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmHardDelete, setConfirmHardDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) return null;

  async function run(fn: () => Promise<void>) {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
        <span className="text-sm text-muted-foreground">{selectedCount} đã chọn</span>
        <Separator orientation="vertical" className="h-4" />

        {isDeleted ? (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => run(onBulkRestore)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Khôi phục
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setConfirmHardDelete(true)}
              className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa vĩnh viễn
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => run(onBulkShow)}>
              <Eye className="h-3.5 w-3.5" />
              Hiển thị
            </Button>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => run(onBulkHide)}>
              <EyeOff className="h-3.5 w-3.5" />
              Ẩn
            </Button>
            <Button variant="outline" size="sm" disabled={loading} onClick={onExportSelected}>
              <Download className="h-3.5 w-3.5" />
              Xuất CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setConfirmDelete(true)}
              className="border-destructive/30 text-destructive hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSelection}
          className="ml-auto h-8 w-8"
          aria-label="Bỏ chọn tất cả"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa {selectedCount} sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Các sản phẩm sẽ bị ẩn và có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={async () => {
                await run(onBulkDelete);
                setConfirmDelete(false);
              }}
            >
              {loading ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmHardDelete} onOpenChange={setConfirmHardDelete}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa vĩnh viễn {selectedCount} sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loading}
              onClick={async () => {
                await run(onBulkHardDelete);
                setConfirmHardDelete(false);
              }}
            >
              {loading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
