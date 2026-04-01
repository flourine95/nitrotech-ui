"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function ProgressBar() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  // Reading progress — scroll-based
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      if (total <= 0) return
      setProgress(Math.min((scrolled / total) * 100, 100))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  // Page navigation progress
  useEffect(() => {
    setVisible(true)
    setProgress(0)
    const t1 = setTimeout(() => setProgress(80), 50)
    const t2 = setTimeout(() => setProgress(100), 300)
    const t3 = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [pathname])

  if (!visible && progress === 0) return null

  return (
    <div
      className="pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-[3px]"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tiến trình tải trang"
    >
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
