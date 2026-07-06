import { formatCurrency } from "@/utils/formatCurrency";
import type { MenuItem } from "@/types/menu";

type MenuCardProps = {
  item: MenuItem;
};

export function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <div className="mb-5 flex h-36 items-end rounded-md bg-[linear-gradient(135deg,#f3efe3,#dce9df)] p-4">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink">{item.category}</span>
      </div>
      <div className="flex min-h-32 flex-col">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-ink">{item.name}</h3>
          <p className="shrink-0 font-bold text-tomato">{formatCurrency(item.price)}</p>
        </div>
        <p className="mt-3 flex-1 text-sm leading-6 text-ink/70">{item.description}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-herb">
          {item.isAvailable ? "Available now" : "Unavailable"}
        </p>
      </div>
    </article>
  );
}

