import ProductDetailClient from '@/components/ProductDetailClient';
import { getProducts } from '@/store/useCatalogStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    return products.map((p) => ({ id: p.id }));
  } catch (err) {
    return [{ id: 'sample-product-id' }];
  }
}
