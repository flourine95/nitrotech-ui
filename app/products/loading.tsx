import { SkeletonProductCard } from "@/components/skeleton"

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar placeholder */}
          <div className="hidden lg:block w-60 flex-shrink-0" aria-hidden="true">
            <div className="sticky top-36 space-y-4">
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          </div>
          {/* Grid */}
          <div className="flex-1 min-w-0">
            <div className="h-8 w-32 animate-pulse rounded-full bg-slate-200 mb-6" />
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
