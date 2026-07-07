import { MenuCard } from "@/components/common/MenuCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublicMenuItems } from "@/services/menuService";

export default async function MenuPage() {
  const menu = await getPublicMenuItems();

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase text-herb">Menu</p>
            <h1 className="mt-2 text-4xl font-black">Browse foods</h1>
          </div>
          <form className="flex flex-wrap gap-2">
            <input className="rounded-md border border-black/15 px-4 py-3 text-sm" name="search" placeholder="Search menu" />
            <select className="rounded-md border border-black/15 px-4 py-3 text-sm" name="sort">
              <option>Latest</option>
              <option>Popular</option>
              <option>Price low to high</option>
              <option>Price high to low</option>
            </select>
          </form>
        </div>
        {menu.notice ? <p className="mt-5 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{menu.notice}</p> : null}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {menu.items.map((item) => (
            <MenuCard item={item} key={item._id || item.name} />
          ))}
        </div>
      </section>
    </main>
  );
}
