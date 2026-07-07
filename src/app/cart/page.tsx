import { CartCheckout } from "@/components/cart/CartClient";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function CartPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10">
        <CartCheckout />
      </section>
    </main>
  );
}
