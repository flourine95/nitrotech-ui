'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'Đơn hàng mất bao lâu để giao?',
    a: 'Nội thành TP.HCM và Hà Nội: 1–2 ngày. Các tỉnh thành khác: 2–4 ngày. Vùng sâu xa: 4–7 ngày làm việc.',
  },
  {
    q: 'Tôi có thể theo dõi đơn hàng không?',
    a: 'Có. Sau khi đơn được giao cho đơn vị vận chuyển, bạn sẽ nhận được mã tracking qua SMS và email để theo dõi trực tiếp.',
  },
  {
    q: 'Đơn hàng trên 500K có được miễn phí vận chuyển không?',
    a: 'Đúng vậy. Tất cả đơn hàng từ 500.000đ trở lên được miễn phí vận chuyển tiêu chuẩn toàn quốc.',
  },
  {
    q: 'Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?',
    a: 'Bạn có thể thay đổi địa chỉ trong vòng 1 giờ sau khi đặt hàng bằng cách liên hệ hotline 1800 6789.',
  },
  {
    q: 'Nếu không có nhà khi giao hàng thì sao?',
    a: 'Shipper sẽ liên hệ trước khi giao. Nếu không liên lạc được, đơn hàng sẽ được giao lại tối đa 2 lần trước khi hoàn về kho.',
  },
];

export function ShippingFaq() {
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
