import { Space_Grotesk, DM_Sans } from "next/font/google"
import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: { default: "NitroTech — Linh kiện điện tử, Laptop & Máy tính", template: "%s | NitroTech" },
  description: "Mua sắm linh kiện điện tử, laptop, PC chính hãng với giá tốt nhất. Giao hàng nhanh, bảo hành uy tín.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={cn(spaceGrotesk.variable, dmSans.variable)}>
      <body className="antialiased font-sans bg-[#F8FAFC] text-[#0F172A]">
        {children}
      </body>
    </html>
  )
}
