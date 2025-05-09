import Header from '@/components/header/header';
import Footer from '@/components/footer/footer';
import BackgroundEffect from '@/components/background-effect/background-effect';
import ProductsGrid from '@/components/products-grid/products-grid';

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050b18] to-[#0a1428] text-white relative overflow-hidden">
      <BackgroundEffect />
      <Header />
      <div className="pt-28 pb-16">
        <ProductsGrid />
      </div>
      <Footer />
    </div>
  );
}
