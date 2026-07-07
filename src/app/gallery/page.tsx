import { SiteHeader } from "@/components/layout/SiteHeader";

const images = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80"
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-4xl font-black">Gallery</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image) => (
            <div className="aspect-square rounded-lg bg-cover bg-center" key={image} style={{ backgroundImage: `url(${image})` }} />
          ))}
        </div>
      </section>
    </main>
  );
}
