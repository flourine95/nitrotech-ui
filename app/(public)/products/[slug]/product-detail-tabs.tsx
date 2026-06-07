'use client';

import { ProductRating } from '@/components/product-rating';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProductSpec {
  label: string;
  value: string;
}

interface ReviewItem {
  name: string;
  role: string;
  rating: number;
  date: string;
  text: string;
}

interface ProductDetailTabsProps {
  productName: string;
  description: string | null;
  specs: ProductSpec[];
  rating: number | null;
  reviewCount: number;
  reviews: ReviewItem[];
}

export function ProductDetailTabs({
  productName,
  description,
  specs,
  rating,
  reviewCount,
  reviews,
}: ProductDetailTabsProps) {
  return (
    <Tabs defaultValue="specs" className="mb-16 gap-6">
      <TabsList variant="line" className="scrollbar-none h-auto w-full justify-start overflow-x-auto">
        <TabsTrigger value="specs" className="px-4 py-2.5">
          Thông số kỹ thuật
        </TabsTrigger>
        <TabsTrigger value="reviews" className="px-4 py-2.5">
          Đánh giá ({reviewCount || 0})
        </TabsTrigger>
        <TabsTrigger value="description" className="px-4 py-2.5">
          Mô tả
        </TabsTrigger>
      </TabsList>

      <TabsContent value="specs">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <caption className="sr-only">Thông số kỹ thuật {productName}</caption>
            <tbody>
              {specs.map((spec, index) => (
                <tr key={spec.label} className={index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                  <td className="w-44 border-r border-border px-6 py-3.5 font-medium text-muted-foreground">
                    {spec.label}
                  </td>
                  <td className="px-6 py-3.5 text-foreground">{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="reviews">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground">Đánh giá từ khách hàng</h2>
            <Button variant="outline" className="rounded-full">
              Viết đánh giá
            </Button>
          </div>

          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-foreground">{rating || 0}</div>
              <div className="my-2 flex justify-center">
                <ProductRating rating={rating || 0} showReviews={false} />
              </div>
              <div className="text-xs text-muted-foreground">{reviewCount || 0} đánh giá</div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {[
                [5, 80],
                [4, 15],
                [3, 3],
                [2, 1],
                [1, 1],
              ].map(([star, percent]) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="w-4 text-xs text-muted-foreground">{star}</span>
                  <ProductRating rating={1} showReviews={false} size="sm" />
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-xs text-muted-foreground">{percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <article key={review.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                      aria-hidden="true"
                    >
                      {review.name
                        .split(' ')
                        .map((part) => part[0])
                        .slice(-2)
                        .join('')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{review.name}</div>
                      <div className="text-xs text-muted-foreground">{review.role}</div>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="mb-2">
                  <ProductRating rating={review.rating} showReviews={false} size="sm" />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="description">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {description ? (
            <ProductDescriptionContent description={description} />
          ) : (
            <p className="text-sm text-muted-foreground">Sản phẩm chưa có mô tả chi tiết.</p>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

function ProductDescriptionContent({ description }: { description: string }) {
  const className =
    'max-w-none text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-foreground [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1';

  if (/<[a-z][\s\S]*>/i.test(description)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: description }} />;
  }

  return <p className={`${className} whitespace-pre-line`}>{description}</p>;
}
