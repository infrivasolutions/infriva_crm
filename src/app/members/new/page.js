"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const roleOptions = [
  {
    label: "Admin",
    value: "admin",
    description: "Full CRM access including leads, clients, projects and team.",
  },
  {
    label: "Ads Manager",
    value: "ads-manager",
    description: "Manage leads, clients, quotations and campaign enquiries.",
  },
  {
    label: "Developer",
    value: "developer",
    description: "Limited access to assigned projects and tasks.",
  },
];

export default function NewMemberPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "developer",
    isActive: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (!token) {
      router.replace("/login");
    }
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
      setSaving(true);
      setError("");

      if (!form.name.trim()) {
        throw new Error("Name is required");
      }

      if (!form.email.trim()) {
        throw new Error("Email is required");
      }

      if (!form.password.trim()) {
        throw new Error("Password is required");
      }

      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        isActive: form.isActive,
      };

      const res = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const memberId = res?.user?._id || res?.data?._id;

      if (memberId) {
        router.push(`/members/${memberId}`);
      } else {
        router.push("/members");
      }
    } catch (err) {
      console.error(err);

      if (
        err?.message?.toLowerCase().includes("token") ||
        err?.message?.toLowerCase().includes("authorized")
      ) {
        localStorage.removeItem("infriva_token");
        localStorage.removeItem("infriva_user");
        router.replace("/login");
        return;
      }

      setError(err?.message || "Failed to create member");
    } finally {
      setSaving(false);
    }
  };

  const selectedRole = roleOptions.find((item) => item.value === form.role);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              New Team Member
            </p>

            <h1 className="mt-2 text-3xl font-black">Add Member</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Create login access for admin, ads manager or developer with
              role-based CRM permissions.
            </p>
          </div>

          <Link
            href="/members"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back to Members
          </Link>
        </section>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]"
        >
          <div className="theme-card p-5 sm:p-6">
            {error && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-black text-foreground">
                Member Information
              </h2>
              <p className="mt-1 text-sm text-muted">
                Add basic details and login credentials.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  Full Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="theme-input pl-11"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Email Address <span className="text-red-500">*</span>
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
                    placeholder="member@infriva.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">Phone</label>

                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="theme-input pl-11"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Password <span className="text-red-500">*</span>
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
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
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

              <div>
                <label className="mb-2 block text-sm font-black">Role</label>

                <div className="relative">
                  <UserCog
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <select
                    value={form.role}
                    onChange={(e) => updateField("role", e.target.value)}
                    className="theme-input pl-11"
                  >
                    {roleOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Account Status
                </label>

                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    updateField("isActive", e.target.value === "active")
                  }
                  className="theme-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href="/members" className="theme-btn-outline">
                Cancel
              </Link>

              <button
                disabled={saving}
                className="theme-btn disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Member
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <ShieldCheck size={24} />
              </div>

              <h2 className="text-xl font-black">Selected Role</h2>

              <div className="mt-4 rounded-3xl bg-surface-alt p-4">
                <p className="text-lg font-black text-primary">
                  {selectedRole?.label}
                </p>

                <p className="mt-2 text-sm leading-7 text-muted">
                  {selectedRole?.description}
                </p>
              </div>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">Access Rules</p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Admin and ads manager can manage business data. Developer should
                only work on assigned projects and tasks.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </DashboardLayout>
  );
}
