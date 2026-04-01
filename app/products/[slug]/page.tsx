import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getProduct, getRelatedProducts, getAllProducts } from "@/lib/products"
import { ProductActions } from "./product-actions"

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  return { title: product?.name ?? "Sản phẩm" }
}

const reviewsData = [
  { name: "Trần Thị Lan Anh", role: "Graphic Designer", rating: 5, date: "15/03/2025", text: "Sản phẩm chất lượng tuyệt vời, giao hàng nhanh. Rất hài lòng với lần mua này tại NitroTech." },
  { name: "Nguyễn Văn Hùng", role: "Developer", rating: 5, date: "02/03/2025", text: "Hàng chính hãng, đóng gói cẩn thận. Giá tại NitroTech tốt hơn nhiều chỗ khác." },
  { name: "Lê Minh Châu", role: "Content Creator", rating: 4, date: "20/02/2025", text: "Hiệu năng xuất sắc, đáng đồng tiền. Nhân viên tư vấn nhiệt tình, hỗ trợ tốt." },
]

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()
  const related = getRelatedProducts(product.relatedSlugs)


  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Trang chủ</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <Link href="/products" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Sản phẩm</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <Link href={`/products?cat=${product.catSlug}`} className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">{product.cat}</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-slate-700 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Product main */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <div>
              <div className="rounded-3xl bg-white border border-slate-200 aspect-square flex items-center justify-center mb-4 shadow-sm">
                <svg viewBox="0 0 200 140" className="w-48 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="10" y="8" width="180" height="110" rx="6" strokeWidth="2"/>
                  <rect x="20" y="18" width="160" height="90" rx="3" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)"/>
                  <path d="M4 118h192l-8 14H12l-8-14z" strokeWidth="2"/>
                </svg>
              </div>
              <div className="flex gap-3">
                {[1,2,3,4].map((i) => (
                  <button key={i} className={`flex-1 aspect-square rounded-2xl bg-white border flex items-center justify-center cursor-pointer transition-colors duration-200 ${i===1?"border-slate-900":"border-slate-200 hover:border-slate-400"}`} aria-label={`Ảnh ${i}`}>
                    <svg viewBox="0 0 40 30" className="w-8 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="2" width="36" height="26" rx="2"/><rect x="5" y="5" width="30" height="20" rx="1" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/></svg>
                  </button>
                ))}
              </div>
            </div>


            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${product.badgeColor}`}>{product.badge}</span>
                <span className="text-xs text-slate-400">SKU: {product.sku}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{product.name}</h1>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">{product.description}</p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-1" aria-label={`${product.rating} sao`}>
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className={`w-4 h-4 ${s<=Math.floor(product.rating)?"text-amber-400":"text-slate-200"} fill-current`} aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-900">{product.rating}</span>
                <span className="text-sm text-slate-400">{product.reviews} đánh giá</span>
                <span className={`text-sm font-medium ${product.inStock?"text-green-600":"text-rose-500"}`}>
                  {product.inStock?"Còn hàng":"Hết hàng"}
                </span>
              </div>

              {/* Price + Variants + Colors + Qty + CTAs + Trust — client */ }
              <ProductActions
                slug={product.slug}
                price={product.price}
                old={product.old}
                discount={product.discount}
                variants={product.variants}
                colors={product.colors}
                stockCount={product.stockCount}
                warranty={product.warranty}
              />
            </div>
          </div>
          {/* Specs */}
          <div className="mb-16">
            <div className="flex gap-1 border-b border-slate-200 mb-8">
              {["Thông số kỹ thuật",`Đánh giá (${product.reviews})`,"Mô tả"].map((tab,i) => (
                <button key={tab} className={`px-5 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer border-b-2 -mb-px ${i===0?"border-slate-900 text-slate-900":"border-transparent text-slate-500 hover:text-slate-900"}`}>{tab}</button>
              ))}
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <caption className="sr-only">Thông số kỹ thuật {product.name}</caption>
                <tbody>
                  {product.specs.map((s,i) => (
                    <tr key={s.label} className={i%2===0?"bg-white":"bg-slate-50"}>
                      <td className="px-6 py-3.5 font-medium text-slate-600 w-44 border-r border-slate-100">{s.label}</td>
                      <td className="px-6 py-3.5 text-slate-900">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {/* Reviews */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
              <button className="px-5 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">Viết đánh giá</button>
            </div>
            <div className="flex items-center gap-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900">{product.rating}</div>
                <div className="flex gap-1 justify-center my-2">
                  {[1,2,3,4,5].map((s) => <svg key={s} viewBox="0 0 24 24" className={`w-4 h-4 ${s<=Math.floor(product.rating)?"text-amber-400":"text-slate-200"} fill-current`} aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <div className="text-xs text-slate-400">{product.reviews} đánh giá</div>
              </div>
              <div className="flex-1 space-y-2">
                {[[5,80],[4,15],[3,3],[2,1],[1,1]].map(([star,pct]) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-4">{star}</span>
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{width:`${pct}%`}}/></div>
                    <span className="text-xs text-slate-400 w-8">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {reviewsData.map((r) => (
                <article key={r.name} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">{r.name.split(" ").map(n=>n[0]).slice(-2).join("")}</div>
                      <div><div className="font-semibold text-sm text-slate-900">{r.name}</div><div className="text-xs text-slate-400">{r.role}</div></div>
                    </div>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <div className="flex gap-1 mb-2" aria-label={`${r.rating} sao`}>
                    {[1,2,3,4,5].map((s) => <svg key={s} viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${s<=r.rating?"text-amber-400":"text-slate-200"} fill-current`} aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Sản phẩm liên quan</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {related.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg flex flex-col">
                    <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                      <svg viewBox="0 0 80 60" className="w-20 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="5" width="70" height="50" rx="4"/><rect x="12" y="12" width="56" height="36" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/></svg>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-slate-400 mb-1">{p.cat}</div>
                      <div className="font-semibold text-sm text-slate-900 mb-3">{p.name}</div>
                      <div className="flex items-center justify-between">
                        <div><div className="font-bold text-sm text-slate-900">{p.price}</div><div className="text-xs text-slate-300 line-through">{p.old}</div></div>
                        <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">Mua</button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
