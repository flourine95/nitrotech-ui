"use client"

export function NewsletterForm() {
  return (
    <form
      className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => e.preventDefault()}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email của bạn
      </label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="Email của bạn"
        required
        className="flex-1 rounded-full border border-white/30 bg-white/15 px-5 py-3 text-sm text-white placeholder-blue-200 transition-colors duration-200 focus:border-white focus:outline-none"
      />
      <button
        type="submit"
        className="cursor-pointer rounded-full bg-white px-6 py-3 text-sm font-semibold whitespace-nowrap text-blue-600 transition-colors duration-200 hover:bg-blue-50"
      >
        Nhận ưu đãi
      </button>
    </form>
  )
}
