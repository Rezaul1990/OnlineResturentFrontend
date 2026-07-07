"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminDashboardResponse, AdminSettings, AdminUser } from "@/types/admin";
import { getAdminDashboard, getAdminProfile, getAdminSettings } from "@/lib/adminApi";
import { AdminOperations } from "@/components/admin/AdminOperations";

const TOKEN_KEY = "online_resturent_admin_token";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      token: string;
      user: AdminUser;
      dashboard: AdminDashboardResponse;
      settings: AdminSettings;
    };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const [profile, dashboard, settings] = await Promise.all([
          getAdminProfile(token),
          getAdminDashboard(token),
          getAdminSettings(token)
        ]);

        setState({
          status: "ready",
          token,
          user: profile.user,
          dashboard,
          settings
        });
      } catch (error) {
        window.localStorage.removeItem(TOKEN_KEY);
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load admin panel"
        });
      }
    };

    void loadDashboard();
  }, [router]);

  const logout = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    router.push("/admin/login");
  };

  if (state.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
        <div className="rounded-md border border-black/10 bg-white px-5 py-4 text-sm font-bold shadow-soft">Loading admin panel...</div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-ink">
        <div className="max-w-md rounded-lg border border-tomato/25 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-black">Session unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-ink/65">{state.message}</p>
          <button className="mt-5 rounded-md bg-tomato px-4 py-2 text-sm font-bold text-white" onClick={() => router.push("/admin/login")}>
            Back to login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/10 bg-ink px-5 py-6 text-white lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-bold uppercase text-white/55">Online Resturent</p>
            <h1 className="mt-2 text-2xl font-black">Admin</h1>
          </div>
          <nav className="mt-8 grid gap-2 text-sm font-semibold">
            {state.dashboard.modules.map((moduleName) => (
              <span className="rounded-md px-3 py-2 text-white/80 hover:bg-white/10" key={moduleName}>
                {moduleName}
              </span>
            ))}
          </nav>
        </aside>

        <section className="px-5 py-6 lg:px-8">
          <header className="flex flex-col justify-between gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-herb">{state.user.role?.name || "Admin"}</p>
              <h2 className="mt-1 text-3xl font-black">{state.user.name}</h2>
              <p className="mt-1 text-sm text-ink/60">{state.user.email}</p>
            </div>
            <button className="rounded-md border border-black/15 px-4 py-2 text-sm font-bold" onClick={logout}>
              Sign out
            </button>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <p className="text-sm font-bold text-ink/60">Restaurant</p>
              <p className="mt-2 text-2xl font-black">{state.settings.restaurantName.en}</p>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <p className="text-sm font-bold text-ink/60">Total orders</p>
              <p className="mt-2 text-2xl font-black">{state.dashboard.totalOrders ?? 0}</p>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <p className="text-sm font-bold text-ink/60">Pending</p>
              <p className="mt-2 text-2xl font-black">{state.dashboard.pendingOrders ?? 0}</p>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <p className="text-sm font-bold text-ink/60">Sales</p>
              <p className="mt-2 text-2xl font-black">BDT {state.dashboard.totalSales ?? 0}</p>
            </div>
          </div>

          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <h3 className="text-xl font-black">New order notifications</h3>
              <div className="mt-4 grid gap-3">
                {(state.dashboard.newOrders || []).length === 0 ? <p className="text-sm text-ink/60">No pending order notifications.</p> : null}
                {(state.dashboard.newOrders || []).map((order) => (
                  <div className="rounded-md bg-cream p-3 text-sm" key={order.orderId}>
                    <p className="font-bold">{order.orderId} - {order.customerName}</p>
                    <p className="text-ink/60">{order.phone} - BDT {order.grandTotal}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <div>
                <h3 className="text-xl font-black">Operations settings</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">
                  Orders are {state.settings.acceptingOrders ? "accepting" : "paused"} and stock decreases on {state.settings.stockDecreaseTrigger}.
                </p>
              </div>
              <span className="rounded-md bg-herb/10 px-3 py-2 text-sm font-bold text-herb">Protected route</span>
            </div>
          </section>

          <AdminOperations token={state.token} />
        </section>
      </div>
    </main>
  );
}
