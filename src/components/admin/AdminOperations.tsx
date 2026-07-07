"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  adjustStock,
  createAdminResource,
  deleteAdminResource,
  listAdminOrders,
  listAdminResource,
  listStockLogs,
  updateAdminResource,
  updateAdminSettings,
  updateOrderPayment,
  updateOrderStatus
} from "@/lib/adminApi";
import type { AdminDashboardResponse, AdminSettings } from "@/types/admin";

type ResourceConfig = {
  key: string;
  label: string;
  template: Record<string, unknown>;
};

const resources: ResourceConfig[] = [
  {
    key: "categories",
    label: "Categories",
    template: { name: { en: "New Category", bn: "" }, slug: "new-category", description: { en: "", bn: "" }, isActive: true, sortOrder: 1 }
  },
  {
    key: "foods",
    label: "Foods",
    template: {
      name: "New Food",
      nameBn: "",
      slug: "new-food",
      description: "Short description",
      category: "Signature Meals",
      price: 100,
      stockQuantity: 10,
      lowStockThreshold: 5,
      isAvailable: true,
      isFeatured: false,
      isPopular: false
    }
  },
  {
    key: "addons",
    label: "Add-ons",
    template: { name: { en: "Extra Sauce", bn: "" }, price: 30, stockQuantity: 50, lowStockThreshold: 5, isAvailable: true }
  },
  {
    key: "coupons",
    label: "Coupons",
    template: { code: "SAVE10", title: "Save 10", discountType: "percentage", discountValue: 10, appliesTo: "all", isActive: true }
  },
  {
    key: "delivery-areas",
    label: "Delivery",
    template: { name: "Mirpur", zone: "Inside Dhaka", charge: 60, isActive: true }
  },
  {
    key: "cms",
    label: "CMS",
    template: { type: "section", slug: "home-section", title: { en: "Section", bn: "" }, content: { en: "", bn: "" }, isActive: true, sortOrder: 1 }
  },
  {
    key: "reviews",
    label: "Reviews",
    template: { customerName: "Customer", rating: 5, message: "Great food", type: "testimonial", status: "Approved", isFeatured: true }
  },
  {
    key: "contacts",
    label: "Messages",
    template: { name: "Customer", phoneOrEmail: "01700000000", subject: "Question", message: "Message", isRead: false }
  },
  {
    key: "roles",
    label: "Roles",
    template: { name: "Manager", description: "Restaurant manager", permissions: ["dashboard.view", "order.view"], isActive: true }
  },
  {
    key: "users",
    label: "Users",
    template: { name: "Staff User", email: "staff@example.com", phone: "01700000000", password: "ChangeMe123!", role: "PASTE_ROLE_ID", isActive: true }
  }
];

const orderStatuses = ["Pending", "Called", "Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery", "Completed", "Cancelled"];
const paymentStatuses = ["Unpaid", "Pending Verification", "Paid", "Partially Paid", "Failed / Rejected", "Refunded"];

const getId = (item: Record<string, unknown>) => String(item._id || item.id || "");
const getTitle = (item: Record<string, unknown>) => {
  const name = item.name;
  if (typeof name === "string") return name;
  if (name && typeof name === "object" && "en" in name) return String((name as { en?: unknown }).en || "Untitled");
  return String(item.orderId || item.code || item.email || item.slug || item.subject || getId(item));
};

const parseJson = (value: string) => JSON.parse(value) as Record<string, unknown>;

type AdminOperationsProps = {
  token: string;
  activeKey: string;
  onActiveChange: (key: string) => void;
  dashboard: AdminDashboardResponse;
  settings: AdminSettings;
};

export function AdminOperations({ token, activeKey, onActiveChange, dashboard, settings }: AdminOperationsProps) {
  const active = activeKey;
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);
  const [formValue, setFormValue] = useState("");
  const [settingsValue, setSettingsValue] = useState(JSON.stringify(settings, null, 2));
  const [selectedId, setSelectedId] = useState("");
  const [status, setStatus] = useState("Confirmed");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [cancelReason, setCancelReason] = useState("Customer cancelled");
  const [stockForm, setStockForm] = useState('{"itemType":"foodItem","itemId":"PASTE_ID","adjustmentType":"increase","quantity":1,"reason":"Manual adjustment"}');
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const activeResource = useMemo(() => resources.find((resource) => resource.key === active), [active]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (active === "orders") {
        const data = await listAdminOrders(token);
        setItems(data.items);
      } else if (active === "stock") {
        const data = await listStockLogs(token);
        setItems(data.items);
      } else if (active === "reports" || active === "settings") {
        setItems([]);
      } else if (activeResource) {
        const data = await listAdminResource(token, activeResource.key);
        setItems(data.items);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [active, activeResource, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const changeActive = (key: string) => {
    const resource = resources.find((item) => item.key === key);
    onActiveChange(key);
    setItems([]);
    setSelectedId("");
    setFormValue(resource ? JSON.stringify(resource.template, null, 2) : "");
    setMessage("");
    setError("");
  };

  const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const updated = await updateAdminSettings(token, parseJson(settingsValue));
      setSettingsValue(JSON.stringify(updated, null, 2));
      setMessage("Settings updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Settings update failed");
    }
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeResource) return;
    setError("");
    setMessage("");
    try {
      await createAdminResource(token, activeResource.key, parseJson(formValue));
      setMessage("Created successfully.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Create failed");
    }
  };

  const submitUpdate = async () => {
    if (!activeResource || !selectedId) return;
    setError("");
    setMessage("");
    try {
      await updateAdminResource(token, activeResource.key, selectedId, parseJson(formValue));
      setMessage("Updated successfully.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Update failed");
    }
  };

  const submitDelete = async () => {
    if (!activeResource || !selectedId || !window.confirm("Delete selected item?")) return;
    setError("");
    setMessage("");
    try {
      await deleteAdminResource(token, activeResource.key, selectedId);
      setMessage("Deleted successfully.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Delete failed");
    }
  };

  const chooseItem = (item: Record<string, unknown>) => {
    setSelectedId(getId(item));
    setFormValue(JSON.stringify(item, null, 2));
  };

  const submitOrderStatus = async () => {
    if (!selectedId) return;
    setError("");
    setMessage("");
    try {
      await updateOrderStatus(token, selectedId, { status, cancelReason: status === "Cancelled" ? cancelReason : undefined });
      setMessage("Order status updated.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Status update failed");
    }
  };

  const submitPayment = async () => {
    if (!selectedId) return;
    setError("");
    setMessage("");
    try {
      await updateOrderPayment(token, selectedId, { paymentStatus });
      setMessage("Payment status updated.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Payment update failed");
    }
  };

  const submitStock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await adjustStock(token, parseJson(stockForm));
      setMessage("Stock adjusted.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Stock adjustment failed");
    }
  };

  return (
    <section className="mt-6 rounded-lg border border-black/10 bg-white p-5" id="admin-operations">
      <div className="flex flex-wrap gap-2">
        <button className={`rounded-md px-3 py-2 text-sm font-bold ${active === "orders" ? "bg-tomato text-white" : "bg-cream"}`} onClick={() => changeActive("orders")}>Orders</button>
        <button className={`rounded-md px-3 py-2 text-sm font-bold ${active === "stock" ? "bg-tomato text-white" : "bg-cream"}`} onClick={() => changeActive("stock")}>Stock</button>
        {resources.map((resource) => (
          <button className={`rounded-md px-3 py-2 text-sm font-bold ${active === resource.key ? "bg-tomato text-white" : "bg-cream"}`} key={resource.key} onClick={() => changeActive(resource.key)}>
            {resource.label}
          </button>
        ))}
        <button className={`rounded-md px-3 py-2 text-sm font-bold ${active === "reports" ? "bg-tomato text-white" : "bg-cream"}`} onClick={() => changeActive("reports")}>Reports</button>
        <button className={`rounded-md px-3 py-2 text-sm font-bold ${active === "settings" ? "bg-tomato text-white" : "bg-cream"}`} onClick={() => changeActive("settings")}>Settings</button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_420px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-black">{activeResource?.label || (active === "stock" ? "Stock logs" : active === "reports" ? "Reports" : active === "settings" ? "Settings" : "Orders")}</h3>
            <button className="rounded-md border border-black/15 px-3 py-2 text-sm font-bold" onClick={load}>{loading ? "Loading..." : "Refresh"}</button>
          </div>
          {active === "reports" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["Total orders", dashboard.totalOrders ?? 0],
                ["Pending orders", dashboard.pendingOrders ?? 0],
                ["Completed orders", dashboard.completedOrders ?? 0],
                ["Cancelled orders", dashboard.cancelledOrders ?? 0],
                ["Total sales", `BDT ${dashboard.totalSales ?? 0}`]
              ].map(([label, value]) => (
                <div className="rounded-md bg-cream p-4" key={label}>
                  <p className="text-sm font-bold text-ink/60">{label}</p>
                  <p className="mt-1 text-2xl font-black">{value}</p>
                </div>
              ))}
              <div className="rounded-md bg-cream p-4 md:col-span-2">
                <p className="text-sm font-black">Best-selling foods</p>
                <div className="mt-2 grid gap-2">
                  {(dashboard.bestSelling || []).length === 0 ? <p className="text-sm text-ink/60">No sales data yet.</p> : null}
                  {(dashboard.bestSelling || []).map((food) => (
                    <div className="flex justify-between text-sm" key={food._id}>
                      <span>{food._id}</span>
                      <strong>{food.quantity} sold / BDT {food.sales}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          {active !== "reports" && active !== "settings" ? (
          <div className="grid max-h-[560px] gap-2 overflow-auto">
            {items.length === 0 ? <p className="rounded-md bg-cream p-4 text-sm text-ink/60">No records found.</p> : null}
            {items.map((item) => (
              <button className={`rounded-md border p-3 text-left text-sm ${selectedId === getId(item) ? "border-tomato bg-tomato/5" : "border-black/10 bg-cream"}`} key={getId(item)} onClick={() => chooseItem(item)}>
                <p className="font-bold">{getTitle(item)}</p>
                <p className="mt-1 truncate text-xs text-ink/55">{getId(item)}</p>
              </button>
            ))}
          </div>
          ) : null}
        </div>

        <div>
          {activeResource ? (
            <form onSubmit={submitCreate}>
              <label className="text-sm font-bold" htmlFor="resource-json">Resource JSON</label>
              <textarea id="resource-json" className="mt-2 min-h-[320px] w-full rounded-md border border-black/15 px-3 py-3 font-mono text-xs" value={formValue} onChange={(event) => setFormValue(event.target.value)} />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white" type="submit">Create</button>
                <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-bold" disabled={!selectedId} onClick={submitUpdate} type="button">Update</button>
                <button className="rounded-md border border-tomato/40 px-4 py-2 text-sm font-bold text-tomato" disabled={!selectedId} onClick={submitDelete} type="button">Delete</button>
              </div>
            </form>
          ) : null}

          {active === "orders" ? (
            <div className="grid gap-3">
              <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                {orderStatuses.map((item) => <option key={item}>{item}</option>)}
              </select>
              {status === "Cancelled" ? <input className="rounded-md border border-black/15 px-4 py-3 text-sm" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /> : null}
              <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white disabled:bg-ink/30" disabled={!selectedId} onClick={submitOrderStatus}>Update status</button>
              <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                {paymentStatuses.map((item) => <option key={item}>{item}</option>)}
              </select>
              <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-bold disabled:bg-ink/10" disabled={!selectedId} onClick={submitPayment}>Update payment</button>
              {selectedId ? <pre className="max-h-[320px] overflow-auto rounded-md bg-cream p-3 text-xs">{formValue}</pre> : null}
            </div>
          ) : null}

          {active === "stock" ? (
            <form onSubmit={submitStock}>
              <label className="text-sm font-bold" htmlFor="stock-json">Stock adjustment JSON</label>
              <textarea id="stock-json" className="mt-2 min-h-40 w-full rounded-md border border-black/15 px-3 py-3 font-mono text-xs" value={stockForm} onChange={(event) => setStockForm(event.target.value)} />
              <button className="mt-3 rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white">Adjust stock</button>
              {selectedId ? <pre className="mt-3 max-h-[260px] overflow-auto rounded-md bg-cream p-3 text-xs">{formValue}</pre> : null}
            </form>
          ) : null}

          {active === "settings" ? (
            <form onSubmit={submitSettings}>
              <label className="text-sm font-bold" htmlFor="settings-json">Settings JSON</label>
              <textarea id="settings-json" className="mt-2 min-h-[420px] w-full rounded-md border border-black/15 px-3 py-3 font-mono text-xs" value={settingsValue} onChange={(event) => setSettingsValue(event.target.value)} />
              <button className="mt-3 rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white">Update settings</button>
            </form>
          ) : null}

          {message ? <p className="mt-3 rounded-md bg-herb/10 p-3 text-sm font-bold text-herb">{message}</p> : null}
          {error ? <p className="mt-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
