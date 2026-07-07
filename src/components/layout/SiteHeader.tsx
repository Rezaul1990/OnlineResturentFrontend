import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 bg-cream/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link className="text-lg font-black text-ink" href="/">
          Online Resturent
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-ink/70 sm:flex">
          <Link className="hover:text-ink" href="/menu">
            Menu
          </Link>
          <Link className="hover:text-ink" href="/track-order">
            Track
          </Link>
          <Link className="hover:text-ink" href="/contact">
            Contact
          </Link>
          <Link className="rounded-md bg-tomato px-3 py-2 text-white" href="/cart">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
