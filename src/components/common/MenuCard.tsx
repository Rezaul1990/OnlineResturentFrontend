import { formatCurrency } from "@/utils/formatCurrency";
import type { MenuItem } from "@/types/menu";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/CartClient";

type MenuCardProps = {
  item: MenuItem;
};

export function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <div
        className="mb-5 flex h-36 items-end rounded-md bg-cover bg-center p-4"
        style={{ backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.45)), url(${item.imageUrl || "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80"})` }}
      >
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">{item.category}</span>
      </div>
      <div className="flex min-h-32 flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-ink">{item.name}</h3>
          <p className="shrink-0 font-bold text-tomato">{formatCurrency(item.price)}</p>
        </div>
        <p className="mt-3 flex-1 text-sm leading-6 text-ink/70">{item.description}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-herb">
          {item.isAvailable && Number(item.stockQuantity ?? 1) > 0 ? "Available now" : "Out of stock"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <AddToCartButton item={item} />
          <Link className="rounded-md border border-black/15 px-4 py-2 text-sm font-bold text-ink" href={`/menu/${item._id || item.name}`}>
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
