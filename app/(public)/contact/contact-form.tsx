'use client';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const subjects = [
  'Tư vấn sản phẩm',
  'Hỗ trợ đơn hàng',
  'Bảo hành & Sửa chữa',
  'Đổi trả hàng',
  'Hợp tác kinh doanh',
  'Khác',
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-8 text-primary" aria-hidden="true" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-foreground">Gửi thành công!</h2>
        <p className="mb-6 text-muted-foreground">Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ.</p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setForm({
              name: '',
              email: '',
              phone: '',
              subject: '',
              message: '',
            });
          }}
          className="h-10 rounded-full px-5"
        >
          Gửi tin nhắn khác
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-6 text-lg font-bold text-foreground">Gửi tin nhắn</h2>
      <FieldGroup>
      <Field>
        <FieldLabel htmlFor="name">
          Họ và tên <span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="name"
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nguyễn Văn A"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="email">
            Email <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@example.com"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">
            Số điện thoại
          </FieldLabel>
          <Input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0912 345 678"
          />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="subject">
          Chủ đề <span className="text-destructive">*</span>
        </FieldLabel>
        <Select
          value={form.subject}
          onValueChange={(subject) => setForm({ ...form, subject })}
          required
        >
          <SelectTrigger id="subject" className="w-full">
            <SelectValue placeholder="Chọn chủ đề..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <Field>
        <FieldLabel htmlFor="message">
          Nội dung <span className="text-destructive">*</span>
        </FieldLabel>
        <Textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Mô tả chi tiết vấn đề của bạn..."
        />
      </Field>
      <Button
        type="submit"
        className="h-10 w-full rounded-full px-5"
      >
        Gửi tin nhắn
      </Button>
      </FieldGroup>
    </form>
  );
}
