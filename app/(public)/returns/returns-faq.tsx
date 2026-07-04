'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Thời gian hoàn tiền mất bao lâu?',
    a: 'Sau khi nhận và kiểm tra sản phẩm, chúng tôi sẽ hoàn tiền trong 3–5 ngày làm việc qua phương thức thanh toán ban đầu.',
  },
  {
    q: 'Ai chịu phí vận chuyển khi đổi trả?',
    a: 'NitroTech chịu phí vận chuyển nếu lỗi do chúng tôi (sai hàng, lỗi kỹ thuật). Khách hàng chịu phí nếu đổi ý.',
  },
  {
    q: 'Tôi có thể đổi sang sản phẩm khác giá cao hơn không?',
    a: 'Có. Bạn chỉ cần thanh toán thêm phần chênh lệch giá.',
  },
  {
    q: 'Sản phẩm mở hộp rồi có đổi trả được không?',
    a: 'Có thể đổi trả nếu sản phẩm bị lỗi kỹ thuật. Trường hợp đổi ý, sản phẩm phải còn nguyên hộp và chưa kích hoạt.',
  },
];

export function ReturnsFaq() {
  return (
    <Accordion type="single" collapsible className="gap-3">
      {faqs.map((faq, i) => (
        <AccordionItem
          key={faq.q}
          value={String(i)}
          className="overflow-hidden rounded-2xl border border-border bg-card px-6"
        >
          <AccordionTrigger className="py-4 hover:no-underline">
            <span className="text-sm font-medium text-foreground">{faq.q}</span>
          </AccordionTrigger>
          <AccordionContent className="border-t border-border pt-3 pb-4 text-sm leading-relaxed text-muted-foreground">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
