"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/adminApi";

const TOKEN_KEY = "online_resturent_admin_token";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await loginAdmin(email, password);
      window.localStorage.setItem(TOKEN_KEY, data.token);
      router.push("/admin");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-5 py-10 text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-sm font-bold uppercase text-herb">Admin panel</p>
          <h1 className="mt-3 max-w-md text-4xl font-black leading-tight">Secure restaurant operations console</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-ink/65">
            Owner and staff access starts here. Disabled users and roles are blocked by the backend.
          </p>
        </section>

        <form className="rounded-lg border border-black/10 bg-white p-6 shadow-soft" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-bold" htmlFor="email">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-black/15 px-4 py-3 text-sm outline-none focus:border-herb"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-bold" htmlFor="password">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-md border border-black/15 px-4 py-3 text-sm outline-none focus:border-herb"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          {error ? (
            <div className="mt-4 rounded-md border border-tomato/30 bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">
              {error}
            </div>
          ) : null}

          <button
            className="mt-6 w-full rounded-md bg-tomato px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-ink/30"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
