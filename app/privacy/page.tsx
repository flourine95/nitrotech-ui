import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "Chính sách bảo mật" }

const sections = [
  {
    id: "thu-thap",
    title: "1. Thu thập thông tin",
    content: [
      "Chúng tôi thu thập thông tin bạn cung cấp trực tiếp khi đăng ký tài khoản, đặt hàng hoặc liên hệ hỗ trợ, bao gồm: họ tên, địa chỉ email, số điện thoại, địa chỉ giao hàng và thông tin thanh toán.",
      "Ngoài ra, chúng tôi tự động thu thập một số dữ liệu kỹ thuật khi bạn truy cập website như địa chỉ IP, loại trình duyệt, trang đã xem và thời gian truy cập nhằm cải thiện trải nghiệm người dùng.",
    ],
  },
  {
    id: "su-dung",
    title: "2. Sử dụng thông tin",
    content: [
      "Thông tin thu thập được sử dụng để xử lý đơn hàng, giao hàng và cung cấp dịch vụ hỗ trợ khách hàng. Chúng tôi cũng sử dụng thông tin để gửi thông báo về trạng thái đơn hàng và các cập nhật quan trọng.",
      "Với sự đồng ý của bạn, chúng tôi có thể gửi email marketing về sản phẩm mới, khuyến mãi và nội dung liên quan. Bạn có thể hủy đăng ký bất kỳ lúc nào qua liên kết trong email.",
    ],
  },
  {
    id: "bao-mat",
    title: "3. Bảo mật dữ liệu",
    content: [
      "NitroTech áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, mất mát hoặc tiết lộ. Dữ liệu thanh toán được mã hóa bằng SSL/TLS.",
      "Chúng tôi giới hạn quyền truy cập vào thông tin cá nhân chỉ cho nhân viên cần thiết để thực hiện công việc và yêu cầu họ tuân thủ các nghĩa vụ bảo mật nghiêm ngặt.",
    ],
  },
  {
    id: "cookie",
    title: "4. Cookie",
    content: [
      "Website sử dụng cookie để ghi nhớ tùy chọn của bạn, duy trì phiên đăng nhập và phân tích lưu lượng truy cập. Cookie là các tệp văn bản nhỏ được lưu trên thiết bị của bạn.",
      "Bạn có thể kiểm soát cookie thông qua cài đặt trình duyệt. Tuy nhiên, việc tắt cookie có thể ảnh hưởng đến một số tính năng của website.",
    ],
  },
  {
    id: "quyen",
    title: "5. Quyền của người dùng",
    content: [
      "Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang tài khoản hoặc bằng cách liên hệ với chúng tôi.",
      "Bạn cũng có quyền phản đối việc xử lý dữ liệu, yêu cầu hạn chế xử lý hoặc yêu cầu chuyển dữ liệu sang định dạng có thể đọc được. Chúng tôi sẽ phản hồi trong vòng 30 ngày làm việc.",
    ],
  },
  {
    id: "lien-he",
    title: "6. Liên hệ",
    content: [
      "Nếu bạn có câu hỏi về chính sách bảo mật hoặc muốn thực hiện quyền của mình, vui lòng liên hệ với chúng tôi qua email: privacy@nitrotech.vn hoặc gọi hotline: 1800 6868.",
      "Địa chỉ: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh. Chúng tôi cam kết xử lý mọi yêu cầu một cách nhanh chóng và minh bạch.",
    ],
  },
]

export default function PrivacyPage() {
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
              Chính sách bảo mật
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Chính sách bảo mật
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
                  <nav aria-label="Mục lục chính sách bảo mật">
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
