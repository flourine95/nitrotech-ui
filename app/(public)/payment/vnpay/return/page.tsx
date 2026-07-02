import type { Metadata } from 'next';
import VnpayReturnContent from './vnpay-return-content';

export const metadata: Metadata = {
  title: 'Kết quả thanh toán VNPay',
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function VnpayReturnPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;

  const normalizedParams = Object.fromEntries(
    Object.entries(resolvedSearchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] ?? '' : value ?? '',
    ]),
  );

  return <VnpayReturnContent initialParams={normalizedParams} />;
}
