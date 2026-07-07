"use client";

import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ContactPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch(`${apiBaseUrl}/public/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Submit failed");
      setMessage("Message sent successfully.");
      formElement.reset();
    } catch (contactError) {
      setError(contactError instanceof Error ? contactError.message : "Submit failed");
    }
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[0.8fr_1fr]">
        <div>
          <p className="text-sm font-bold uppercase text-herb">Contact</p>
          <h1 className="mt-2 text-4xl font-black">Talk to the restaurant</h1>
          <p className="mt-4 leading-7 text-ink/70">Send a message for catering, delivery questions, feedback, or support.</p>
          <div className="mt-6 rounded-lg border border-black/10 bg-white p-5 text-sm leading-7">
            <p>Phone: +880 1XXXXXXXXX</p>
            <p>Email: hello@restaurant.local</p>
            <p>Address: Dhaka, Bangladesh</p>
          </div>
        </div>
        <form className="rounded-lg border border-black/10 bg-white p-5" onSubmit={submit}>
          {["name", "phoneOrEmail", "subject"].map((field) => (
            <input className="mb-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm" key={field} name={field} placeholder={field} required />
          ))}
          <textarea className="min-h-36 w-full rounded-md border border-black/15 px-4 py-3 text-sm" name="message" placeholder="message" required />
          {message ? <p className="mt-3 rounded-md bg-herb/10 p-3 text-sm font-bold text-herb">{message}</p> : null}
          {error ? <p className="mt-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
          <button className="mt-4 rounded-md bg-tomato px-5 py-3 text-sm font-bold text-white">Send message</button>
        </form>
      </section>
    </main>
  );
}
