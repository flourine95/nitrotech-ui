export default function OrdersLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-7 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-5 w-24 animate-pulse rounded-xl bg-slate-100" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-5 w-28 animate-pulse rounded-lg bg-slate-200" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded-lg bg-slate-100" />
            </div>

            <div className="space-y-4 px-6 py-4">
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((__, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 animate-pulse rounded-lg bg-slate-200" />
                      <div className="h-3 w-24 animate-pulse rounded-lg bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-3 w-28 animate-pulse rounded-lg bg-slate-100" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-2 text-right">
                    <div className="h-3 w-16 animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-5 w-24 animate-pulse rounded-lg bg-slate-200" />
                  </div>
                  <div className="h-10 w-24 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
