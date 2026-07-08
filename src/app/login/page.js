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
  Users,
  FolderKanban,
  ListTodo,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function FeatureCard({ title, desc, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-border bg-white/75 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <Icon size={21} />
      </div>

      <p className="mt-4 text-xl font-black text-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{desc}</p>
    </div>
  );
}

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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="theme-card w-full max-w-sm p-8 text-center">
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
      <div className="absolute -left-35 -top-35 h-80 w-[320px] rounded-full bg-primary/20 blur-3xl sm:h-105 sm:w-105" />
      <div className="absolute -bottom-40 -right-35 h-90 w-90 rounded-full bg-primary/15 blur-3xl sm:h-115 sm:w-115" />
      <div className="absolute left-1/2 top-1/2 hidden h-80 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-100/50 blur-3xl lg:block" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        {/* Left Branding */}
        <section className="hidden flex-col justify-between border-r border-border bg-white/45 p-8 backdrop-blur-xl lg:flex xl:p-10">
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

            <div className="mt-20 max-w-xl xl:mt-24">
              <p className="text-sm font-black uppercase tracking-[0.32em] text-primary">
                CRM Dashboard
              </p>

              <h2 className="mt-5 text-4xl font-black leading-tight text-foreground xl:text-5xl">
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
            <FeatureCard title="Leads" desc="Manage enquiries" icon={Users} />

            <FeatureCard
              title="Tasks"
              desc="Assign team work"
              icon={ListTodo}
            />

            <FeatureCard title="CRM" desc="One dashboard" icon={FolderKanban} />
          </div>
        </section>

        {/* Login Form */}
        <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-7 flex justify-center lg:hidden">
              <div className="flex items-center gap-3 rounded-3xl border border-border bg-white/80 px-5 py-4 shadow-xl shadow-purple-100 backdrop-blur">
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

            <div className="theme-card overflow-hidden p-5 shadow-2xl shadow-purple-100 sm:p-8">
              <div className="mb-7 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary-light text-primary">
                  <ShieldCheck size={30} />
                </div>

                <h2 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
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
                      className="theme-input"
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
                      className="theme-input pr-12"
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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

            <p className="mt-5 text-center text-xs font-semibold text-muted">
              © {new Date().getFullYear()} Infriva Solutions. CRM Access Only.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
