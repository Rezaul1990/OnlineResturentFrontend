"use client";

import { Suspense } from "react";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type TrackedOrder = {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  grandTotal: number;
  preferredTime?: string;
};

function TrackOrderForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setOrder(null);
    try {
      const response = await fetch(`${apiBaseUrl}/public/track-order/${orderId}?phone=${encodeURIComponent(phone)}`);
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Order not found");
      setOrder(payload.data);
    } catch (trackError) {
      setError(trackError instanceof Error ? trackError.message : "Order not found");
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-4xl font-black">Track order</h1>
        <form className="mt-6 rounded-lg border border-black/10 bg-white p-5" onSubmit={submit}>
          <input className="w-full rounded-md border border-black/15 px-4 py-3 text-sm" placeholder="Order ID" value={orderId} onChange={(event) => setOrderId(event.target.value)} required />
          <input className="mt-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm" placeholder="Phone number" value={phone} onChange={(event) => setPhone(event.target.value)} required />
          <button className="mt-4 rounded-md bg-tomato px-5 py-3 text-sm font-bold text-white">Track</button>
          {error ? <p className="mt-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
        </form>
        {order ? (
          <article className="mt-6 rounded-lg border border-black/10 bg-white p-5">
            <div className="flex justify-between gap-4">
              <div>
                <p className="text-sm text-ink/60">Order</p>
                <h2 className="text-2xl font-black">{order.orderId}</h2>
              </div>
              <span className="h-fit rounded-md bg-herb/10 px-3 py-2 text-sm font-bold text-herb">{order.orderStatus}</span>
            </div>
            <p className="mt-4 text-sm">Payment: {order.paymentStatus}</p>
            <p className="mt-1 text-sm">Grand total: BDT {order.grandTotal}</p>
            <p className="mt-1 text-sm">Preferred time: {order.preferredTime || "Not specified"}</p>
          </article>
        ) : null}
      </section>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <SiteHeader />
      <Suspense fallback={<section className="mx-auto max-w-3xl px-5 py-10 text-sm font-bold">Loading tracking form...</section>}>
        <TrackOrderForm />
      </Suspense>
    </main>
  );
}
