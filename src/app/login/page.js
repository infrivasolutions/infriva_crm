"use client";

import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (token) {
      router.replace("/dashboard");
      return;
    }

    setChecking(false);
  }, [router]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.email.trim()) {
        throw new Error("Email is required");
      }

      if (!form.password.trim()) {
        throw new Error("Password is required");
      }

      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const token = res?.token || res?.data?.token;
      const user = res?.user || res?.data?.user;

      if (!token) {
        throw new Error("Login successful but token not received");
      }

      localStorage.setItem("infriva_token", token);

      if (user) {
        localStorage.setItem("infriva_user", JSON.stringify(user));
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="theme-card p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-primary" size={34} />
          <p className="mt-4 text-lg font-black text-foreground">
            Checking session...
          </p>
          <p className="mt-2 text-sm text-muted">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute left-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-primary/15 blur-3xl" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left Branding */}
        <section className="hidden flex-col justify-between border-r border-border bg-white/45 p-10 backdrop-blur-xl lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-purple-200">
                <Sparkles size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-black text-foreground">Infriva</h1>
                <p className="text-sm font-semibold text-muted">Business CRM</p>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <p className="text-sm font-black uppercase tracking-[0.32em] text-primary">
                CRM Dashboard
              </p>

              <h2 className="mt-5 text-5xl font-black leading-tight text-foreground">
                Manage leads, projects and team work in one smart panel.
              </h2>

              <p className="mt-6 text-base leading-8 text-muted">
                Track Meta Ads leads, website enquiries, WhatsApp leads,
                quotations, projects, tasks and client updates with a clean
                Infriva CRM system.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="theme-card-soft p-5">
              <p className="text-2xl font-black text-primary">Leads</p>
              <p className="mt-2 text-sm text-muted">Manage enquiries</p>
            </div>

            <div className="theme-card-soft p-5">
              <p className="text-2xl font-black text-primary">Tasks</p>
              <p className="mt-2 text-sm text-muted">Assign team work</p>
            </div>

            <div className="theme-card-soft p-5">
              <p className="text-2xl font-black text-primary">CRM</p>
              <p className="mt-2 text-sm text-muted">One dashboard</p>
            </div>
          </div>
        </section>

        {/* Login Form */}
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-purple-200">
                  <Sparkles size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-black text-foreground">
                    Infriva
                  </h1>
                  <p className="text-sm font-semibold text-muted">
                    Business CRM
                  </p>
                </div>
              </div>
            </div>

            <div className="theme-card p-6 shadow-2xl sm:p-8">
              <div className="mb-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-light text-primary">
                  <ShieldCheck size={30} />
                </div>

                <h2 className="mt-5 text-3xl font-black text-foreground">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Login to your Infriva CRM dashboard.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-foreground">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="theme-input pl-11"
                      placeholder="admin@infriva.com"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-foreground">
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      className="theme-input pl-11 pr-12"
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="theme-btn h-13 w-full disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={19} className="animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login to CRM
                      <ArrowRight size={19} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-surface-alt p-4 text-center">
                <p className="text-xs font-semibold leading-5 text-muted">
                  Only authorized Infriva team members can access this CRM.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
