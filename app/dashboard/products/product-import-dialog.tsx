'use client';
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, FileUp, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { createProduct } from '@/lib/api/products';
import { parseImportCSV, type ParsedImportRow, downloadCSV } from './utils';

const TEMPLATE_CSV = `name,slug,categoryId,brandId,description,thumbnail,active
iPhone 16 Pro,iphone-16-pro,1,2,Mô tả sản phẩm,https://example.com/img.jpg,true
Samsung Galaxy S25,samsung-galaxy-s25,1,3,,, true`;

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 'upload' | 'preview' | 'result';

interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export function ProductImportDialog({ open, onClose, onSuccess }: ImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<ParsedImportRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setStep('upload');
    setRows([]);
    setResult(null);
    setImporting(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function processFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      toast.error('Chỉ hỗ trợ file CSV');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseImportCSV(text);
      if (parsed.length === 0) {
        toast.error('File không có dữ liệu hoặc sai định dạng');
        return;
      }
      setRows(parsed);
      setStep('preview');
    };
    reader.readAsText(file, 'utf-8');
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => !r.error);
    if (validRows.length === 0) {
      toast.error('Không có dòng hợp lệ để import');
      return;
    }
    setImporting(true);
    const errors: ImportResult['errors'] = [];
    let success = 0;

    for (const row of validRows) {
      try {
        await createProduct({
          name: row.name,
          slug: row.slug,
          categoryId: row.categoryId,
          brandId: row.brandId ?? null,
          description: row.description ?? null,
          thumbnail: row.thumbnail ?? null,
          active: row.active,
          images: [],
          variants: [],
        });
        success++;
      } catch (e) {
        errors.push({
          row: row.row,
          message: e instanceof Error ? e.message : 'Lỗi không xác định',
        });
      }
    }

    setResult({ success, failed: errors.length, errors });
    setStep('result');
    setImporting(false);
    if (success > 0) onSuccess();
  }

  const { validCount, errorCount } = rows.reduce(
    (acc, r) => {
      if (r.error) {
        acc.errorCount++;
      } else {
        acc.validCount++;
      }
      return acc;
    },
    { validCount: 0, errorCount: 0 },
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import sản phẩm</DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Tải lên file CSV để import hàng loạt sản phẩm.'}
            {step === 'preview' &&
              `Xem trước ${rows.length} dòng — ${validCount} hợp lệ, ${errorCount} lỗi.`}
            {step === 'result' && 'Kết quả import.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-ring hover:bg-muted/50'}`}
            >
              <FileUp className={`h-10 w-10 ${dragOver ? 'text-primary' : 'text-muted-foreground/40'}`} />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Kéo thả file CSV vào đây</p>
                <p className="text-xs text-muted-foreground">hoặc nhấn để chọn file</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Tải template CSV</p>
                <p className="text-xs text-muted-foreground">
                  Cột: name, slug, categoryId, brandId, description, thumbnail, active
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs"
                onClick={() => downloadCSV(TEMPLATE_CSV, 'product-import-template.csv')}
              >
                <Download className="h-3.5 w-3.5" />
                Template
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="space-y-3">
            <div className="max-h-80 overflow-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Dòng</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Tên</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Slug</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Cat ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-muted-foreground">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((r) => (
                    <tr key={r.row} className={r.error ? 'bg-destructive/5' : ''}>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{r.row}</td>
                      <td className="px-3 py-2 font-medium text-foreground">
                        {r.name || <span className="text-destructive">—</span>}
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {r.slug || <span className="text-destructive">—</span>}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {r.categoryId || <span className="text-destructive">—</span>}
                      </td>
                      <td className="px-3 py-2">
                        {r.error ? (
                          <span className="inline-flex items-center gap-1 text-rose-600">
                            <AlertCircle className="h-3 w-3" /> {r.error}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> Hợp lệ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {errorCount > 0 && (
              <p className="text-xs text-amber-600">
                {errorCount} dòng lỗi sẽ bị bỏ qua. Chỉ {validCount} dòng hợp lệ sẽ được import.
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={reset}>
                <X className="h-3.5 w-3.5" /> Chọn lại
              </Button>
              <Button
                size="sm"
                className="rounded-xl"
                disabled={validCount === 0 || importing}
                onClick={handleImport}
              >
                <Upload className="h-3.5 w-3.5" />
                {importing ? `Đang import...` : `Import ${validCount} sản phẩm`}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-900 dark:bg-green-950">
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{result.success}</p>
                <p className="text-xs text-green-600 dark:text-green-500">Thành công</p>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                <p className="text-xs text-destructive/80">Thất bại</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-40 overflow-auto rounded-xl border border-rose-200 bg-rose-50 p-3">
                <p className="mb-2 text-xs font-semibold text-rose-700">Chi tiết lỗi:</p>
                {result.errors.map((e) => (
                  <p key={e.row} className="text-xs text-rose-600">
                    Dòng {e.row}: {e.message}
                  </p>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={reset}>
                Import thêm
              </Button>
              <Button size="sm" className="rounded-xl" onClick={handleClose}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
