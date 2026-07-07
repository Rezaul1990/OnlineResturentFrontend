import { SiteHeader } from "@/components/layout/SiteHeader";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="text-sm font-bold uppercase text-herb">About</p>
          <h1 className="mt-2 text-4xl font-black">Fresh meals with careful kitchen operations</h1>
          <p className="mt-5 leading-7 text-ink/70">This restaurant website supports multilingual content, public ordering, guest tracking, and a protected admin workflow for real daily operations.</p>
        </div>
        <div className="min-h-80 rounded-lg bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80)" }} />
      </section>
    </main>
  );
}
