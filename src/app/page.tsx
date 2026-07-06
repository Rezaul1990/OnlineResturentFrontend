import { MenuCard } from "@/components/common/MenuCard";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getFeaturedMenuItems } from "@/services/menuService";

export default async function HomePage() {
  const menu = await getFeaturedMenuItems();

  return (
    <main>
      <SiteHeader />

      <section className="border-b border-black/10 bg-cream">
        <div className="mx-auto grid min-h-[560px] max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <StatusBadge tone={menu.source === "api" ? "success" : "warning"}>
              {menu.source === "api" ? "Live menu connected" : "Sample menu mode"}
            </StatusBadge>
            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight text-ink sm:text-6xl">
              Fresh restaurant meals, ready for online ordering.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink/70">
              A production-ready starter for menu browsing, restaurant operations, and future ordering workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-md bg-tomato px-5 py-3 text-sm font-bold text-white" href="#menu">
                View menu
              </a>
              <a className="rounded-md border border-black/15 px-5 py-3 text-sm font-bold text-ink" href="#service">
                Explore service
              </a>
            </div>
            {menu.notice ? <p className="mt-5 max-w-xl text-sm text-tomato">{menu.notice}</p> : null}
          </div>

          <div className="rounded-lg bg-ink p-6 text-white shadow-soft">
            <div className="aspect-[4/3] rounded-md bg-[linear-gradient(135deg,#cf3f2e,#f0b35b_45%,#2f6f4e)] p-6">
              <div className="flex h-full flex-col justify-between rounded-md bg-white/90 p-5 text-ink">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-herb">Today&apos;s kitchen</p>
                  <h2 className="mt-3 text-3xl font-black">Fast prep, clean menu data, better orders.</h2>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm font-bold">
                  <div className="rounded-md bg-cream p-3">Menu</div>
                  <div className="rounded-md bg-cream p-3">Orders</div>
                  <div className="rounded-md bg-cream p-3">Reports</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-herb">Featured menu</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Popular dishes</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-ink/65">
            Menu cards are wired to the backend API and fall back to safe sample data until MongoDB is configured.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {menu.items.map((item) => (
            <MenuCard key={item._id || item.name} item={item} />
          ))}
        </div>
      </section>

      <section id="service" className="border-y border-black/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 md:grid-cols-3">
          {["Online menu", "Order workflow", "Admin ready"].map((title) => (
            <div key={title}>
              <h3 className="text-lg font-black text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">
                Built as a clean starting point for a real restaurant system with API, validation, and deployable apps.
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink/60">
        Online Resturent starter project.
      </footer>
    </main>
  );
}

