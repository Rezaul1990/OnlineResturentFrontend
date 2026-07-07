import { SiteHeader } from "@/components/layout/SiteHeader";

const faqs = [
  ["Do I need an account?", "No. Customers can order and track as guests."],
  ["When is my order final?", "Support will call before final confirmation."],
  ["Can I choose pickup?", "Yes. Pickup orders have no delivery charge."]
];

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-4xl font-black">FAQ</h1>
        <div className="mt-6 grid gap-3">
          {faqs.map(([question, answer]) => (
            <article className="rounded-lg border border-black/10 bg-white p-5" key={question}>
              <h2 className="font-black">{question}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/70">{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
