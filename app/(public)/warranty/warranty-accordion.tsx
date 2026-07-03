'use client';
import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const warrantyByCategory = [
  { category: 'Laptop', duration: '12 – 24 tháng', note: 'Tùy hãng sản xuất' },
  { category: 'CPU / GPU', duration: '36 tháng', note: 'Bảo hành chính hãng' },
  { category: 'RAM / SSD', duration: '36 – 60 tháng', note: 'Tùy thương hiệu' },
  { category: 'Màn hình', duration: '24 tháng', note: 'Bao gồm lỗi điểm ảnh' },
  { category: 'Bàn phím / Chuột', duration: '12 tháng', note: 'Lỗi kỹ thuật' },
  { category: 'Tai nghe', duration: '12 tháng', note: 'Lỗi kỹ thuật' },
];

const steps = [
  {
    step: '01',
    title: 'Liên hệ hỗ trợ',
    desc: 'Gọi hotline 1800 6789 hoặc mang sản phẩm đến cửa hàng gần nhất.',
  },
  {
    step: '02',
    title: 'Kiểm tra sản phẩm',
    desc: 'Kỹ thuật viên kiểm tra và xác nhận lỗi trong vòng 30 phút.',
  },
  {
    step: '03',
    title: 'Tiếp nhận bảo hành',
    desc: 'Lập phiếu bảo hành, thông báo thời gian hoàn trả dự kiến.',
  },
  {
    step: '04',
    title: 'Sửa chữa / Đổi mới',
    desc: 'Sửa chữa hoặc đổi sản phẩm mới tùy theo tình trạng lỗi.',
  },
];

const accordionItems: { id: string; title: string; content: ReactNode }[] = [
  {
    id: 'dieu-kien',
    title: 'Điều kiện bảo hành',
    content: (
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {[
          'Sản phẩm còn trong thời hạn bảo hành',
          'Tem bảo hành còn nguyên vẹn, không bị rách hoặc tẩy xóa',
          'Sản phẩm có hóa đơn mua hàng tại NitroTech',
          'Lỗi do nhà sản xuất, không phải do tác động bên ngoài',
          'Sản phẩm không bị ngấm nước, cháy nổ, hoặc va đập mạnh',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'thoi-gian',
    title: 'Thời gian bảo hành theo danh mục',
    content: (
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Danh mục</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Thời gian</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {warrantyByCategory.map((row, i) => (
              <tr key={row.category} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                <td className="px-4 py-3 font-medium text-foreground">{row.category}</td>
                <td className="px-4 py-3 text-foreground">{row.duration}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'quy-trinh',
    title: 'Quy trình bảo hành',
    content: (
      <div className="flex flex-col gap-4">
        {steps.map((s) => (
          <div key={s.step} className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {s.step}
            </div>
            <div>
              <div className="mb-1 font-semibold text-foreground">{s.title}</div>
              <div className="text-sm text-muted-foreground">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'khong-bao-hanh',
    title: 'Các trường hợp không được bảo hành',
    content: (
      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {[
          'Hư hỏng do va đập, rơi vỡ, bị ép lực',
          'Ngấm nước, ẩm ướt, tiếp xúc hóa chất',
          'Tự ý tháo lắp, sửa chữa không đúng kỹ thuật',
          'Tem bảo hành bị rách, tẩy xóa hoặc không còn',
          'Hư hỏng do thiên tai, hỏa hoạn, điện áp bất thường',
          'Sản phẩm hết hạn bảo hành',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'lien-he',
    title: 'Liên hệ bảo hành',
    content: (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold text-foreground">Hotline bảo hành:</span> 1800 6789 (miễn
          phí, 8:00 – 20:00)
        </p>
        <p>
          <span className="font-semibold text-foreground">Email:</span> warranty@nitrotech.vn
        </p>
        <p>
          <span className="font-semibold text-foreground">Địa chỉ:</span> 123 Nguyễn Huệ, Quận 1, TP.
          Hồ Chí Minh
        </p>
        <p>
          <span className="font-semibold text-foreground">Giờ tiếp nhận:</span> Thứ 2 – Chủ nhật,
          8:00 – 18:00
        </p>
      </div>
    ),
  },
];

export function WarrantyAccordion() {
  return (
    <Accordion type="single" defaultValue="dieu-kien" className="gap-3">
      {accordionItems.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <span className="font-semibold text-foreground">{item.title}</span>
          </AccordionTrigger>
          <AccordionContent className="border-t border-border px-6 pt-4 pb-5">
            {item.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
