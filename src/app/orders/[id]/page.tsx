import OrderTrackingClient from '@/components/OrderTrackingClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderTrackingClient id={id} />;
}

export function generateStaticParams() {
  return [{ id: 'sample-order-id' }];
}
