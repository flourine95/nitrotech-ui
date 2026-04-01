import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "Điều khoản sử dụng" }

const sections = [
  {
    id: "dieu-khoan-chung",
    title: "1. Điều khoản chung",
    content: [
      "Bằng cách truy cập và sử dụng website NitroTech, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi.",
      "NitroTech có quyền thay đổi, chỉnh sửa hoặc cập nhật các điều khoản này bất kỳ lúc nào mà không cần thông báo trước. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.",
    ],
  },
  {
    id: "tai-khoan",
    title: "2. Tài khoản người dùng",
    content: [
      "Để sử dụng đầy đủ các tính năng của website, bạn cần tạo tài khoản với thông tin chính xác và đầy đủ. Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của mình.",
      "NitroTech có quyền tạm khóa hoặc xóa tài khoản nếu phát hiện vi phạm điều khoản sử dụng, gian lận hoặc hành vi gây hại cho hệ thống và người dùng khác.",
    ],
  },
  {
    id: "mua-hang",
    title: "3. Mua hàng & Thanh toán",
    content: [
      "Tất cả giá sản phẩm hiển thị trên website đã bao gồm VAT. Chúng tôi chấp nhận thanh toán qua thẻ tín dụng/ghi nợ, ví điện tử (MoMo, ZaloPay, VNPay) và chuyển khoản ngân hàng.",
      "Đơn hàng chỉ được xác nhận sau khi thanh toán thành công. NitroTech có quyền hủy đơn hàng trong trường hợp sản phẩm hết hàng hoặc có lỗi về giá, và sẽ hoàn tiền đầy đủ trong vòng 3-5 ngày làm việc.",
    ],
  },
  {
    id: "van-chuyen",
    title: "4. Vận chuyển & Giao hàng",
    content: [
      "Chúng tôi giao hàng toàn quốc. Thời gian giao hàng dự kiến: 2 giờ tại TP.HCM và Hà Nội (nội thành), 1-2 ngày tại các tỉnh thành khác. Thời gian có thể thay đổi tùy điều kiện thực tế.",
      "Phí vận chuyển được tính dựa trên địa chỉ giao hàng và trọng lượng đơn hàng. Miễn phí vận chuyển cho đơn hàng từ 500.000₫ trở lên.",
    ],
  },
  {
    id: "doi-tra",
    title: "5. Đổi trả & Hoàn tiền",
    content: [
      "Bạn có thể đổi trả sản phẩm trong vòng 30 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi kỹ thuật, không đúng mô tả hoặc bị hư hỏng trong quá trình vận chuyển. Sản phẩm cần còn nguyên hộp và đầy đủ phụ kiện.",
      "Hoàn tiền sẽ được xử lý trong vòng 5-7 ngày làm việc sau khi chúng tôi nhận và kiểm tra sản phẩm trả về. Tiền sẽ được hoàn về phương thức thanh toán ban đầu.",
    ],
  },
  {
    id: "so-huu-tri-tue",
    title: "6. Sở hữu trí tuệ",
    content: [
      "Toàn bộ nội dung trên website NitroTech bao gồm văn bản, hình ảnh, logo, thiết kế và phần mềm đều thuộc quyền sở hữu của NitroTech hoặc các đối tác được cấp phép.",
      "Bạn không được sao chép, phân phối, chỉnh sửa hoặc sử dụng bất kỳ nội dung nào cho mục đích thương mại mà không có sự cho phép bằng văn bản từ NitroTech.",
    ],
  },
  {
    id: "gioi-han",
    title: "7. Giới hạn trách nhiệm",
    content: [
      "NitroTech không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.",
      "Trách nhiệm tối đa của NitroTech trong mọi trường hợp không vượt quá giá trị đơn hàng liên quan đến khiếu nại.",
    ],
  },
  {
    id: "thay-doi",
    title: "8. Thay đổi điều khoản",
    content: [
      "NitroTech có quyền cập nhật điều khoản sử dụng bất kỳ lúc nào. Chúng tôi sẽ thông báo về các thay đổi quan trọng qua email hoặc thông báo nổi bật trên website.",
      "Ngày cập nhật lần cuối sẽ được hiển thị ở đầu trang. Nếu bạn có câu hỏi về điều khoản, vui lòng liên hệ: legal@nitrotech.vn.",
    ],
  },
]

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50">
        {/* Breadcrumb */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-sm text-slate-400">
            <Link
              href="/"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-700"
            >
              Trang chủ
            </Link>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="font-medium text-slate-700">
              Điều khoản sử dụng
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Điều khoản sử dụng
            </h1>
            <p className="text-sm text-slate-500">
              Cập nhật lần cuối:{" "}
              <span className="font-medium text-slate-700">01/01/2025</span>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex gap-10">
            {/* Content */}
            <article className="min-w-0 flex-1 space-y-10">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32"
                >
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    {section.title}
                  </h2>
                  {section.content.map((para, i) => (
                    <p
                      key={i}
                      className="mb-3 text-sm leading-relaxed text-slate-600"
                    >
                      {para}
                    </p>
                  ))}
                </section>
              ))}
            </article>

            {/* Sidebar TOC */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-36">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Mục lục
                  </p>
                  <nav aria-label="Mục lục điều khoản sử dụng">
                    <ul className="space-y-1">
                      {sections.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="block cursor-pointer rounded-lg px-3 py-1.5 text-sm leading-snug text-slate-500 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
                          >
                            {section.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
