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

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "checkbox" | "select" | "textarea" | "permissions";
  options?: string[];
};

type ResourceConfig = {
  key: string;
  label: string;
  fields: Field[];
};

const resources: ResourceConfig[] = [
  {
    key: "categories",
    label: "Categories",
    fields: [
      { name: "nameEn", label: "Name English" },
      { name: "nameBn", label: "Name Bangla" },
      { name: "slug", label: "Slug" },
      { name: "descriptionEn", label: "Description English", type: "textarea" },
      { name: "descriptionBn", label: "Description Bangla", type: "textarea" },
      { name: "imageUrl", label: "Image URL" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "foods",
    label: "Foods",
    fields: [
      { name: "name", label: "Name English" },
      { name: "nameBn", label: "Name Bangla" },
      { name: "slug", label: "Slug" },
      { name: "category", label: "Category name" },
      { name: "description", label: "Short description English", type: "textarea" },
      { name: "descriptionBn", label: "Short description Bangla", type: "textarea" },
      { name: "price", label: "Base price", type: "number" },
      { name: "stockQuantity", label: "Stock quantity", type: "number" },
      { name: "lowStockThreshold", label: "Low stock threshold", type: "number" },
      { name: "imageUrl", label: "Image URL" },
      { name: "isAvailable", label: "Available", type: "checkbox" },
      { name: "isFeatured", label: "Featured", type: "checkbox" },
      { name: "isPopular", label: "Popular", type: "checkbox" }
    ]
  },
  {
    key: "addons",
    label: "Add-ons",
    fields: [
      { name: "nameEn", label: "Name English" },
      { name: "nameBn", label: "Name Bangla" },
      { name: "price", label: "Price", type: "number" },
      { name: "stockQuantity", label: "Stock quantity", type: "number" },
      { name: "lowStockThreshold", label: "Low stock threshold", type: "number" },
      { name: "isAvailable", label: "Available", type: "checkbox" }
    ]
  },
  {
    key: "coupons",
    label: "Coupons",
    fields: [
      { name: "code", label: "Coupon code" },
      { name: "title", label: "Title" },
      { name: "discountType", label: "Discount type", type: "select", options: ["percentage", "fixed"] },
      { name: "discountValue", label: "Discount value", type: "number" },
      { name: "appliesTo", label: "Applies to", type: "select", options: ["all", "categories", "products"] },
      { name: "minimumOrderAmount", label: "Minimum order amount", type: "number" },
      { name: "maximumDiscountAmount", label: "Maximum discount amount", type: "number" },
      { name: "usageLimit", label: "Usage limit", type: "number" },
      { name: "perPhoneUsageLimit", label: "Per phone usage limit", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "delivery-areas",
    label: "Delivery",
    fields: [
      { name: "name", label: "Area / Thana name" },
      { name: "zone", label: "Zone", type: "select", options: ["Inside Dhaka", "Outside Dhaka"] },
      { name: "charge", label: "Delivery charge", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "cms",
    label: "CMS",
    fields: [
      { name: "type", label: "Content type", type: "select", options: ["hero", "section", "about", "banner", "gallery", "faq", "testimonial", "policy", "seo", "footer", "contact"] },
      { name: "slug", label: "Slug" },
      { name: "titleEn", label: "Title English" },
      { name: "titleBn", label: "Title Bangla" },
      { name: "subtitleEn", label: "Subtitle English" },
      { name: "subtitleBn", label: "Subtitle Bangla" },
      { name: "contentEn", label: "Content English", type: "textarea" },
      { name: "contentBn", label: "Content Bangla", type: "textarea" },
      { name: "imageUrl", label: "Image URL" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "reviews",
    label: "Reviews",
    fields: [
      { name: "customerName", label: "Customer name" },
      { name: "phone", label: "Phone" },
      { name: "rating", label: "Rating", type: "number" },
      { name: "message", label: "Message", type: "textarea" },
      { name: "type", label: "Type", type: "select", options: ["review", "testimonial"] },
      { name: "status", label: "Status", type: "select", options: ["Pending", "Approved", "Rejected"] },
      { name: "isFeatured", label: "Featured testimonial", type: "checkbox" }
    ]
  },
  {
    key: "contacts",
    label: "Messages",
    fields: [
      { name: "name", label: "Name" },
      { name: "phoneOrEmail", label: "Phone or email" },
      { name: "subject", label: "Subject" },
      { name: "message", label: "Message", type: "textarea" },
      { name: "isRead", label: "Marked read", type: "checkbox" }
    ]
  },
  {
    key: "roles",
    label: "Roles",
    fields: [
      { name: "name", label: "Role name" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "permissions", label: "Permissions", type: "permissions" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  },
  {
    key: "users",
    label: "Users",
    fields: [
      { name: "name", label: "Staff name" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "password", label: "Password" },
      { name: "role", label: "Role", type: "select" },
      { name: "isActive", label: "Active", type: "checkbox" }
    ]
  }
];

const defaultValues: Record<string, Record<string, string | number | boolean>> = {
  categories: { nameEn: "", nameBn: "", slug: "", descriptionEn: "", descriptionBn: "", imageUrl: "", sortOrder: 1, isActive: true },
  foods: { name: "", nameBn: "", slug: "", category: "", description: "", descriptionBn: "", price: 0, stockQuantity: 0, lowStockThreshold: 5, imageUrl: "", isAvailable: true, isFeatured: false, isPopular: false },
  addons: { nameEn: "", nameBn: "", price: 0, stockQuantity: 0, lowStockThreshold: 5, isAvailable: true },
  coupons: { code: "", title: "", discountType: "percentage", discountValue: 0, appliesTo: "all", minimumOrderAmount: 0, maximumDiscountAmount: 0, usageLimit: 0, perPhoneUsageLimit: 0, isActive: true },
  "delivery-areas": { name: "", zone: "Inside Dhaka", charge: 60, isActive: true },
  cms: { type: "section", slug: "", titleEn: "", titleBn: "", subtitleEn: "", subtitleBn: "", contentEn: "", contentBn: "", imageUrl: "", sortOrder: 1, isActive: true },
  reviews: { customerName: "", phone: "", rating: 5, message: "", type: "review", status: "Pending", isFeatured: false },
  contacts: { name: "", phoneOrEmail: "", subject: "", message: "", isRead: false },
  roles: { name: "", description: "", permissions: "dashboard.view,order.view", isActive: true },
  users: { name: "", email: "", phone: "", password: "", role: "", isActive: true }
};

const orderStatuses = ["Pending", "Called", "Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery", "Completed", "Cancelled"];
const paymentStatuses = ["Unpaid", "Pending Verification", "Paid", "Partially Paid", "Failed / Rejected", "Refunded"];
const permissionGroups = [
  { label: "Dashboard", permissions: ["dashboard.view"] },
  { label: "Menu", permissions: ["menu.view", "menu.create", "menu.edit", "menu.delete", "category.view", "category.create", "category.edit", "category.delete"] },
  { label: "Orders", permissions: ["order.view", "order.update", "order.cancel"] },
  { label: "Payment", permissions: ["payment.verify"] },
  { label: "Coupons", permissions: ["coupon.view", "coupon.create", "coupon.edit", "coupon.delete"] },
  { label: "Delivery", permissions: ["delivery.manage"] },
  { label: "Stock", permissions: ["stock.manage"] },
  { label: "Content", permissions: ["feedback.manage", "contact.manage", "cms.manage", "seo.manage", "gallery.manage"] },
  { label: "Users", permissions: ["user.manage", "role.manage"] },
  { label: "Reports & Settings", permissions: ["reports.view", "settings.manage"] }
];

const getId = (item: Record<string, unknown>) => String(item._id || item.id || "");
const text = (value: unknown) => (value == null ? "" : String(value));
const localized = (value: unknown, key: "en" | "bn") => (value && typeof value === "object" && key in value ? text((value as Record<string, unknown>)[key]) : "");
const bool = (value: unknown) => Boolean(value);
const number = (value: unknown) => Number(value || 0);
const selectedPermissions = (value: unknown) => text(value).split(",").map((item) => item.trim()).filter(Boolean);

const getTitle = (item: Record<string, unknown>) => {
  const name = item.name;
  if (typeof name === "string") return name;
  if (name && typeof name === "object" && "en" in name) return text((name as { en?: unknown }).en || "Untitled");
  return text(item.orderId || item.code || item.email || item.slug || item.subject || getId(item));
};

const flattenItem = (resource: string, item: Record<string, unknown>) => {
  if (resource === "categories") return { nameEn: localized(item.name, "en"), nameBn: localized(item.name, "bn"), slug: text(item.slug), descriptionEn: localized(item.description, "en"), descriptionBn: localized(item.description, "bn"), imageUrl: text(item.imageUrl), sortOrder: number(item.sortOrder), isActive: bool(item.isActive) };
  if (resource === "addons") return { nameEn: localized(item.name, "en"), nameBn: localized(item.name, "bn"), price: number(item.price), stockQuantity: number(item.stockQuantity), lowStockThreshold: number(item.lowStockThreshold), isAvailable: bool(item.isAvailable) };
  if (resource === "cms") return { type: text(item.type), slug: text(item.slug), titleEn: localized(item.title, "en"), titleBn: localized(item.title, "bn"), subtitleEn: localized(item.subtitle, "en"), subtitleBn: localized(item.subtitle, "bn"), contentEn: localized(item.content, "en"), contentBn: localized(item.content, "bn"), imageUrl: text(item.imageUrl), sortOrder: number(item.sortOrder), isActive: bool(item.isActive) };
  if (resource === "roles") return { name: text(item.name), description: text(item.description), permissions: Array.isArray(item.permissions) ? item.permissions.join(",") : "", isActive: bool(item.isActive) };
  if (resource === "users") {
    const role = item.role && typeof item.role === "object" ? getId(item.role as Record<string, unknown>) : text(item.role);
    return { name: text(item.name), email: text(item.email), phone: text(item.phone), password: "", role, isActive: bool(item.isActive) };
  }
  return { ...defaultValues[resource], ...item };
};

const buildPayload = (resource: string, form: Record<string, string | number | boolean>) => {
  if (resource === "categories") return { name: { en: form.nameEn, bn: form.nameBn }, slug: form.slug, description: { en: form.descriptionEn, bn: form.descriptionBn }, imageUrl: form.imageUrl, sortOrder: Number(form.sortOrder), isActive: Boolean(form.isActive) };
  if (resource === "addons") return { name: { en: form.nameEn, bn: form.nameBn }, price: Number(form.price), stockQuantity: Number(form.stockQuantity), lowStockThreshold: Number(form.lowStockThreshold), isAvailable: Boolean(form.isAvailable) };
  if (resource === "cms") return { type: form.type, slug: form.slug, title: { en: form.titleEn, bn: form.titleBn }, subtitle: { en: form.subtitleEn, bn: form.subtitleBn }, content: { en: form.contentEn, bn: form.contentBn }, imageUrl: form.imageUrl, sortOrder: Number(form.sortOrder), isActive: Boolean(form.isActive) };
  if (resource === "roles") return { name: form.name, description: form.description, permissions: text(form.permissions).split(",").map((item) => item.trim()).filter(Boolean), isActive: Boolean(form.isActive) };
  if (resource === "users") {
    const payload: Record<string, unknown> = { name: form.name, email: form.email, phone: form.phone, role: form.role, isActive: Boolean(form.isActive) };
    if (form.password) payload.password = form.password;
    return payload;
  }
  return Object.fromEntries(Object.entries(form).map(([key, value]) => [key, typeof value === "number" ? Number(value) : value]));
};

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
  const [form, setForm] = useState<Record<string, string | number | boolean>>(defaultValues[active] || {});
  const [roles, setRoles] = useState<Array<Record<string, unknown>>>([]);
  const [selectedId, setSelectedId] = useState("");
  const [drawerItem, setDrawerItem] = useState<Record<string, unknown> | null>(null);
  const [status, setStatus] = useState("Confirmed");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [cancelReason, setCancelReason] = useState("Customer cancelled");
  const [stockForm, setStockForm] = useState({ itemType: "foodItem", itemId: "", adjustmentType: "increase", quantity: 1, reason: "Manual adjustment" });
  const [settingsForm, setSettingsForm] = useState({
    restaurantNameEn: settings.restaurantName.en,
    restaurantNameBn: settings.restaurantName.bn,
    acceptingOrders: settings.acceptingOrders,
    stockDecreaseTrigger: settings.stockDecreaseTrigger,
    currency: settings.currency
  });
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

      if (active === "users") {
        const data = await listAdminResource(token, "roles");
        setRoles(data.items);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [active, activeResource, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems([]);
      setSelectedId("");
      setDrawerItem(null);
      setForm(defaultValues[active] || {});
      setMessage("");
      setError("");
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [active, load]);

  const changeActive = (key: string) => {
    onActiveChange(key);
  };

  const updateField = (field: Field, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field.name]: field.type === "number" ? Number(value || 0) : value
    }));
  };

  const togglePermission = (permission: string) => {
    setForm((current) => {
      const selected = new Set(selectedPermissions(current.permissions));
      if (selected.has(permission)) {
        selected.delete(permission);
      } else {
        selected.add(permission);
      }

      return {
        ...current,
        permissions: Array.from(selected).join(",")
      };
    });
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeResource) return;
    setError("");
    setMessage("");
    try {
      await createAdminResource(token, activeResource.key, buildPayload(activeResource.key, form));
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
      await updateAdminResource(token, activeResource.key, selectedId, buildPayload(activeResource.key, form));
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
    if (active === "orders") {
      setDrawerItem(item);
      return;
    }
    if (activeResource) setForm(flattenItem(activeResource.key, item) as Record<string, string | number | boolean>);
  };

  const submitOrderStatus = async () => {
    if (!selectedId) return;
    setError("");
    setMessage("");
    try {
      await updateOrderStatus(token, selectedId, { status, cancelReason: status === "Cancelled" ? cancelReason : undefined });
      setMessage("Order status updated.");
      setDrawerItem(null);
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
      setDrawerItem(null);
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
      await adjustStock(token, stockForm);
      setMessage("Stock adjusted.");
      await load();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Stock adjustment failed");
    }
  };

  const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await updateAdminSettings(token, {
        restaurantName: { en: settingsForm.restaurantNameEn, bn: settingsForm.restaurantNameBn },
        acceptingOrders: settingsForm.acceptingOrders,
        stockDecreaseTrigger: settingsForm.stockDecreaseTrigger,
        currency: settingsForm.currency
      });
      setMessage("Settings updated successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Settings update failed");
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

      <div className={`mt-5 grid gap-5 ${active === "orders" ? "" : "xl:grid-cols-[1fr_480px]"}`}>
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
            </div>
          ) : null}

          {active !== "reports" && active !== "settings" ? (
            <div className="grid max-h-[560px] gap-2 overflow-auto">
              {items.length === 0 ? <p className="rounded-md bg-cream p-4 text-sm text-ink/60">No records found.</p> : null}
              {items.map((item) => (
                <button className={`rounded-md border p-3 text-left text-sm ${selectedId === getId(item) ? "border-tomato bg-tomato/5" : "border-black/10 bg-cream"}`} key={getId(item)} onClick={() => chooseItem(item)}>
                  <p className="font-bold">{getTitle(item)}</p>
                  <p className="mt-1 truncate text-xs text-ink/55">{active === "orders" ? `${text(item.phone)} - BDT ${text(item.grandTotal)}` : getId(item)}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {active !== "orders" ? (
        <div>
          {activeResource ? (
            <form className="grid gap-3" onSubmit={submitCreate}>
              {activeResource.fields.map((field) => {
                const options = field.name === "role" ? roles.map((role) => ({ label: getTitle(role), value: getId(role) })) : field.options?.map((option) => ({ label: option, value: option }));

                if (field.type === "checkbox") {
                  return (
                    <label className="flex items-center gap-2 rounded-md bg-cream px-3 py-2 text-sm font-bold" key={field.name}>
                      <input checked={Boolean(form[field.name])} onChange={(event) => updateField(field, event.target.checked)} type="checkbox" />
                      {field.label}
                    </label>
                  );
                }

                if (field.type === "select") {
                  return (
                    <label className="text-sm font-bold" key={field.name}>
                      {field.label}
                      <select className="mt-2 w-full rounded-md border border-black/15 px-3 py-2 text-sm" value={text(form[field.name])} onChange={(event) => updateField(field, event.target.value)}>
                        <option value="">Select {field.label}</option>
                        {(options || []).map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <label className="text-sm font-bold" key={field.name}>
                      {field.label}
                      <textarea className="mt-2 min-h-20 w-full rounded-md border border-black/15 px-3 py-2 text-sm" value={text(form[field.name])} onChange={(event) => updateField(field, event.target.value)} />
                    </label>
                  );
                }

                if (field.type === "permissions") {
                  const selected = new Set(selectedPermissions(form.permissions));
                  const allPermissions = permissionGroups.flatMap((group) => group.permissions);
                  const allSelected = allPermissions.every((permission) => selected.has(permission));

                  return (
                    <fieldset className="rounded-md border border-black/10 p-3" key={field.name}>
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <legend className="text-sm font-black">{field.label}</legend>
                        <button
                          className="rounded-md border border-black/15 px-3 py-2 text-xs font-bold"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              permissions: allSelected ? "" : allPermissions.join(",")
                            }))
                          }
                          type="button"
                        >
                          {allSelected ? "Clear all" : "Select all"}
                        </button>
                      </div>
                      <div className="mt-3 grid gap-3">
                        {permissionGroups.map((group) => (
                          <div className="rounded-md bg-cream p-3" key={group.label}>
                            <p className="text-xs font-black uppercase text-ink/60">{group.label}</p>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {group.permissions.map((permission) => (
                                <label className="flex items-center gap-2 text-sm font-semibold" key={permission}>
                                  <input checked={selected.has(permission)} onChange={() => togglePermission(permission)} type="checkbox" />
                                  {permission}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  );
                }

                return (
                  <label className="text-sm font-bold" key={field.name}>
                    {field.label}
                    <input className="mt-2 w-full rounded-md border border-black/15 px-3 py-2 text-sm" type={field.type || "text"} value={text(form[field.name])} onChange={(event) => updateField(field, event.target.value)} />
                  </label>
                );
              })}
              <div className="flex flex-wrap gap-2 pt-1">
                <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white" type="submit">Create</button>
                <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-bold" disabled={!selectedId} onClick={submitUpdate} type="button">Update</button>
                <button className="rounded-md border border-tomato/40 px-4 py-2 text-sm font-bold text-tomato" disabled={!selectedId} onClick={submitDelete} type="button">Delete</button>
              </div>
            </form>
          ) : null}

          {active === "stock" ? (
            <form className="grid gap-3" onSubmit={submitStock}>
              <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={stockForm.itemType} onChange={(event) => setStockForm({ ...stockForm, itemType: event.target.value })}>
                <option value="foodItem">Food item</option>
                <option value="variation">Variation</option>
                <option value="addOn">Add-on</option>
              </select>
              <input className="rounded-md border border-black/15 px-4 py-3 text-sm" placeholder="Selected item ID" value={stockForm.itemId} onChange={(event) => setStockForm({ ...stockForm, itemId: event.target.value })} />
              <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={stockForm.adjustmentType} onChange={(event) => setStockForm({ ...stockForm, adjustmentType: event.target.value })}>
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="set">Set exact quantity</option>
              </select>
              <input className="rounded-md border border-black/15 px-4 py-3 text-sm" min={0} type="number" value={stockForm.quantity} onChange={(event) => setStockForm({ ...stockForm, quantity: Number(event.target.value) })} />
              <input className="rounded-md border border-black/15 px-4 py-3 text-sm" placeholder="Reason" value={stockForm.reason} onChange={(event) => setStockForm({ ...stockForm, reason: event.target.value })} />
              <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white">Adjust stock</button>
            </form>
          ) : null}

          {active === "settings" ? (
            <form className="grid gap-3" onSubmit={submitSettings}>
              <input className="rounded-md border border-black/15 px-4 py-3 text-sm" value={settingsForm.restaurantNameEn} onChange={(event) => setSettingsForm({ ...settingsForm, restaurantNameEn: event.target.value })} placeholder="Restaurant name English" />
              <input className="rounded-md border border-black/15 px-4 py-3 text-sm" value={settingsForm.restaurantNameBn} onChange={(event) => setSettingsForm({ ...settingsForm, restaurantNameBn: event.target.value })} placeholder="Restaurant name Bangla" />
              <input className="rounded-md border border-black/15 px-4 py-3 text-sm" value={settingsForm.currency} onChange={(event) => setSettingsForm({ ...settingsForm, currency: event.target.value })} placeholder="Currency" />
              <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={settingsForm.stockDecreaseTrigger} onChange={(event) => setSettingsForm({ ...settingsForm, stockDecreaseTrigger: event.target.value as AdminSettings["stockDecreaseTrigger"] })}>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Preparing</option>
              </select>
              <label className="flex items-center gap-2 rounded-md bg-cream px-3 py-2 text-sm font-bold">
                <input checked={settingsForm.acceptingOrders} onChange={(event) => setSettingsForm({ ...settingsForm, acceptingOrders: event.target.checked })} type="checkbox" />
                Accepting orders
              </label>
              <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white">Update settings</button>
            </form>
          ) : null}

          {message ? <p className="mt-3 rounded-md bg-herb/10 p-3 text-sm font-bold text-herb">{message}</p> : null}
          {error ? <p className="mt-3 rounded-md bg-tomato/10 p-3 text-sm font-bold text-tomato">{error}</p> : null}
        </div>
        ) : null}
      </div>
      {active === "orders" && drawerItem ? (
        <div className="fixed inset-0 z-50 bg-black/35" role="dialog" aria-modal="true">
          <button className="absolute inset-0 h-full w-full cursor-default" aria-label="Close order drawer" onClick={() => setDrawerItem(null)} type="button" />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <header className="border-b border-black/10 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase text-herb">Order details</p>
                  <h3 className="mt-1 text-2xl font-black">{text(drawerItem.orderId)}</h3>
                  <p className="mt-1 text-sm text-ink/60">{text(drawerItem.customerName)} - {text(drawerItem.phone)}</p>
                </div>
                <button className="rounded-md border border-black/15 px-3 py-2 text-sm font-bold" onClick={() => setDrawerItem(null)} type="button">
                  Close
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-auto px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Status", drawerItem.orderStatus],
                  ["Payment", drawerItem.paymentStatus],
                  ["Type", drawerItem.orderType],
                  ["Method", drawerItem.paymentMethod],
                  ["Area", drawerItem.area],
                  ["Total", `BDT ${text(drawerItem.grandTotal)}`]
                ].map(([label, value]) => (
                  <div className="rounded-md bg-cream p-3" key={String(label)}>
                    <p className="text-xs font-bold uppercase text-ink/55">{text(label)}</p>
                    <p className="mt-1 font-black">{text(value)}</p>
                  </div>
                ))}
              </div>

              <section className="mt-4 rounded-md border border-black/10 p-4">
                <h4 className="font-black">Items</h4>
                <div className="mt-3 grid gap-2 text-sm">
                  {Array.isArray(drawerItem.items) ? drawerItem.items.map((item, index) => {
                    const orderItem = item as Record<string, unknown>;
                    return (
                      <div className="flex justify-between gap-3 border-b border-black/10 pb-2 last:border-b-0 last:pb-0" key={`${text(orderItem.name)}-${index}`}>
                        <span>{text(orderItem.name)} x {text(orderItem.quantity)}</span>
                        <strong>BDT {text(orderItem.lineTotal)}</strong>
                      </div>
                    );
                  }) : <p className="text-ink/60">No item details found.</p>}
                </div>
              </section>

              {drawerItem.note ? (
                <section className="mt-4 rounded-md border border-black/10 p-4">
                  <h4 className="font-black">Customer note</h4>
                  <p className="mt-2 text-sm text-ink/70">{text(drawerItem.note)}</p>
                </section>
              ) : null}
            </div>

            <footer className="border-t border-black/10 bg-cream px-5 py-4">
              <div className="grid gap-3">
                <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {orderStatuses.map((item) => <option key={item}>{item}</option>)}
                </select>
                {status === "Cancelled" ? <input className="rounded-md border border-black/15 px-4 py-3 text-sm" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /> : null}
                <button className="rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white" onClick={submitOrderStatus}>Update status</button>
                <select className="rounded-md border border-black/15 px-4 py-3 text-sm" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}>
                  {paymentStatuses.map((item) => <option key={item}>{item}</option>)}
                </select>
                <button className="rounded-md border border-black/15 bg-white px-4 py-2 text-sm font-bold" onClick={submitPayment}>Update payment</button>
              </div>
            </footer>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
