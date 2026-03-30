"use client"

export function NewsletterForm() {
  return (
    <form
      className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="newsletter-email" className="sr-only">Email của bạn</label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="Email của bạn"
        required
        className="flex-1 px-5 py-3 rounded-full bg-white/15 border border-white/30 text-white placeholder-blue-200 text-sm focus:outline-none focus:border-white transition-colors duration-200"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-full text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200 cursor-pointer whitespace-nowrap"
      >
        Nhận ưu đãi
      </button>
    </form>
  )
}
