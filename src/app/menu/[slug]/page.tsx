import { AddToCartButton } from "@/components/cart/CartClient";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { sampleMenu } from "@/constants/sampleMenu";
import { apiClient } from "@/lib/apiClient";
import type { MenuItem } from "@/types/menu";
import { formatCurrency } from "@/utils/formatCurrency";

type FoodResponse = { food: MenuItem; reviews: Array<{ _id: string; customerName: string; rating: number; message: string }> };

export default async function FoodDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let food = sampleMenu.find((item) => item._id === slug) || sampleMenu[0];
  let reviews: FoodResponse["reviews"] = [];
  try {
    const data = await apiClient<FoodResponse>(`/public/foods/${slug}`);
    food = data.food;
    reviews = data.reviews;
  } catch {
    reviews = [];
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="min-h-[420px] rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${food.imageUrl || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1100&q=80"})` }} />
        <div>
          <p className="text-sm font-bold uppercase text-herb">{food.category}</p>
          <h1 className="mt-2 text-4xl font-black">{food.name}</h1>
          <p className="mt-4 text-lg font-black text-tomato">{formatCurrency(food.price)}</p>
          <p className="mt-5 leading-7 text-ink/70">{food.description}</p>
          <div className="mt-6 grid gap-3">
            {food.variations?.map((variation) => (
              <div className="flex justify-between rounded-md border border-black/10 bg-white p-3 text-sm" key={variation._id}>
                <span>{variation.name.en}</span>
                <span>{variation.isAvailable && variation.stockQuantity > 0 ? formatCurrency(variation.price) : "Out of stock"}</span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <AddToCartButton item={food} />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-12">
        <h2 className="text-2xl font-black">Customer reviews</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {reviews.length === 0 ? <p className="text-sm text-ink/60">No approved reviews yet.</p> : null}
          {reviews.map((review) => (
            <article className="rounded-lg border border-black/10 bg-white p-4" key={review._id}>
              <p className="font-bold">{review.customerName}</p>
              <p className="text-sm text-tomato">{review.rating}/5</p>
              <p className="mt-2 text-sm text-ink/70">{review.message}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
