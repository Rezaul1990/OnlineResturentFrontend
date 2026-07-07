"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import type { MenuItem } from "@/types/menu";

const CART_KEY = "online_resturent_cart";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type CartLine = {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  variationId?: string;
  variationName?: string;
  addOnIds?: string[];
};

type CheckoutState = {
  customerName: string;
  phone: string;
  orderType: "Delivery" | "Pickup";
  address: string;
  area: string;
  zone: "Inside Dhaka" | "Outside Dhaka";
  preferredTime: string;
  note: string;
  couponCode: string;
  paymentMethod: "Cash on Delivery" | "Pay at Pickup" | "Manual bKash" | "Manual Nagad";
  transactionId: string;
};

type OrderSuccess = {
  orderId: string;
  trackingUrl: string;
  order: {
    orderStatus: string;
    paymentStatus: string;
    orderType: string;
    paymentMethod: string;
    subtotal: number;
    couponDiscount: number;
    deliveryCharge: number;
    grandTotal: number;
    preferredTime?: string;
    items: Array<{
      name: string;
      quantity: number;
      lineTotal: number;
      variationName?: string;
    }>;
  };
};

const readCart = (): CartLine[] => {
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || "[]") as CartLine[];
  } catch {
    return [];
  }
};

export function AddToCartButton({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);
  const disabled = !item.isAvailable || Number(item.stockQuantity ?? 1) <= 0;

  const add = () => {
    const current = readCart();
    const existing = current.find((line) => line.foodItemId === item._id);
    const next = existing
      ? current.map((line) => (line.foodItemId === item._id ? { ...line, quantity: line.quantity + 1 } : line))
      : [...current, { foodItemId: item._id || item.name, name: item.name, price: item.price, quantity: 1 }];
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    setAdded(true);
  };

  return (
    <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white disabled:bg-ink/30" disabled={disabled} onClick={add}>
      {disabled ? "Out of stock" : added ? "Added" : "Add to cart"}
    </button>
  );
}

export function CartCheckout() {
  const [cart, setCart] = useState<CartLine[]>(() => (typeof window === "undefined" ? [] : readCart()));
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<OrderSuccess | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CheckoutState>({
    customerName: "",
    phone: "",
    orderType: "Delivery",
    address: "",
    area: "",
    zone: "Inside Dhaka",
    preferredTime: "",
    note: "",
    couponCode: "",
    paymentMethod: "Cash on Delivery",
    transactionId: ""
  });

  const subtotal = useMemo(() => cart.reduce((sum, line) => sum + line.price * line.quantity, 0), [cart]);

  const updateQuantity = (foodItemId: string, quantity: number) => {
    const next = cart.map((line) => (line.foodItemId === foodItemId ? { ...line, quantity: Math.max(1, quantity) } : line));
    setCart(next);
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const remove = (foodItemId: string) => {
    const next = cart.filter((line) => line.foodItemId !== foodItemId);
    setCart(next);
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/public/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((line) => ({
            foodItemId: line.foodItemId,
            quantity: line.quantity,
            variationId: line.variationId,
            addOnIds: line.addOnIds || []
          }))
        })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Order failed");
      window.localStorage.removeItem(CART_KEY);
      setCart([]);
      setSuccess(payload.data as OrderSuccess);
      setMessage("Order request submitted successfully. Our support team will call you shortly to confirm your order.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="rounded-lg border border-black/10 bg-white p-5">
        <h1 className="text-3xl font-black">Cart</h1>
        {cart.length === 0 ? <p className="mt-4 text-sm text-ink/60">Your cart is empty.</p> : null}
        <div className="mt-5 grid gap-3">
          {cart.map((line) => (
            <div className="flex flex-col justify-between gap-3 border-b border-black/10 pb-3 sm:flex-row sm:items-center" key={line.foodItemId}>
              <div>
                <p className="font-bold">{line.name}</p>
                <p className="text-sm text-ink/60">BDT {line.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <input className="w-20 rounded-md border border-black/15 px-3 py-2" min={1} type="number" value={line.quantity} onChange={(event) => updateQuantity(line.foodItemId, Number(event.target.value))} />
                <button className="rounded-md border border-black/15 px-3 py-2 text-sm font-bold" onClick={() => remove(line.foodItemId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xl font-black">Subtotal: BDT {subtotal}</p>
      </section>

      <form className="rounded-lg border border-black/10 bg-white p-5" onSubmit={submit}>
        <h2 className="text-2xl font-black">Checkout</h2>
        {(["customerName", "phone", "address", "area", "preferredTime", "couponCode", "transactionId"] as const).map((field) => (
          <input
            className="mt-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm"
            key={field}
            placeholder={field}
            required={["customerName", "phone"].includes(field) || (form.orderType === "Delivery" && ["address", "area"].includes(field)) || (["Manual bKash", "Manual Nagad"].includes(form.paymentMethod) && field === "transactionId")}
            value={form[field]}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
          />
        ))}
        <select className="mt-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm" value={form.orderType} onChange={(event) => setForm({ ...form, orderType: event.target.value as CheckoutState["orderType"], paymentMethod: event.target.value === "Pickup" ? "Pay at Pickup" : "Cash on Delivery" })}>
          <option>Delivery</option>
          <option>Pickup</option>
        </select>
        <select className="mt-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm" value={form.zone} onChange={(event) => setForm({ ...form, zone: event.target.value as CheckoutState["zone"] })}>
          <option>Inside Dhaka</option>
          <option>Outside Dhaka</option>
        </select>
        <select className="mt-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm" value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value as CheckoutState["paymentMethod"] })}>
          <option>Cash on Delivery</option>
          <option>Pay at Pickup</option>
          <option>Manual bKash</option>
          <option>Manual Nagad</option>
        </select>
        <textarea className="mt-3 w-full rounded-md border border-black/15 px-4 py-3 text-sm" placeholder="Order note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        {error ? <p className="mt-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
        {message ? <p className="mt-3 rounded-md bg-herb/10 p-3 text-sm font-bold text-herb">{message}</p> : null}
        {success ? (
          <section className="mt-4 rounded-lg border border-herb/30 bg-herb/5 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-sm font-bold uppercase text-herb">Order submitted</p>
                <h3 className="mt-1 text-2xl font-black">{success.orderId}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/70">
                  Please keep this Order ID. You can track the order status after phone verification.
                </p>
              </div>
              <Link
                className="rounded-md bg-tomato px-4 py-2 text-center text-sm font-bold text-white"
                href={`/track-order?orderId=${encodeURIComponent(success.orderId)}`}
              >
                Track order
              </Link>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-3 border-t border-herb/20 pt-3">
                <span>Status</span>
                <strong>{success.order.orderStatus}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Order type</span>
                <strong>{success.order.orderType}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Payment</span>
                <strong>{success.order.paymentMethod} / {success.order.paymentStatus}</strong>
              </div>
              {success.order.preferredTime ? (
                <div className="flex justify-between gap-3">
                  <span>Preferred time</span>
                  <strong>{success.order.preferredTime}</strong>
                </div>
              ) : null}
            </div>

            <div className="mt-4 rounded-md bg-white p-3">
              <p className="text-sm font-black">Items</p>
              <div className="mt-2 grid gap-2">
                {success.order.items.map((item, index) => (
                  <div className="flex justify-between gap-3 text-sm" key={`${item.name}-${index}`}>
                    <span>
                      {item.name}
                      {item.variationName ? ` (${item.variationName})` : ""} x {item.quantity}
                    </span>
                    <strong>BDT {item.lineTotal}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <span>Subtotal</span>
                <strong>BDT {success.order.subtotal}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Delivery charge</span>
                <strong>BDT {success.order.deliveryCharge}</strong>
              </div>
              <div className="flex justify-between gap-3">
                <span>Coupon discount</span>
                <strong>- BDT {success.order.couponDiscount}</strong>
              </div>
              <div className="flex justify-between gap-3 border-t border-herb/20 pt-3 text-base">
                <span className="font-black">Grand total</span>
                <strong>BDT {success.order.grandTotal}</strong>
              </div>
            </div>
          </section>
        ) : null}
        <button className="mt-4 w-full rounded-md bg-tomato px-5 py-3 text-sm font-bold text-white disabled:bg-ink/30" disabled={loading || cart.length === 0} type="submit">
          {loading ? "Submitting..." : "Submit order request"}
        </button>
      </form>
    </div>
  );
}
