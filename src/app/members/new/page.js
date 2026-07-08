"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
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
import { useEffect, useMemo, useState } from "react";

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

function Field({ label, required, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
        {Icon && <Icon size={15} className="text-primary" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-foreground sm:text-xl">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{desc}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Icon size={22} />
        </div>
      </div>

      {children}
    </section>
  );
}

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

  const selectedRole = useMemo(() => {
    return roleOptions.find((item) => item.value === form.role);
  }, [form.role]);

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

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6"
        >
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  New Team Member
                </p>

                <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  Add Member
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  Create login access for admin, ads manager or developer with
                  role-based CRM permissions.
                </p>
              </div>

              <Link
                href="/members"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:w-fit sm:rounded-full"
              >
                <ArrowLeft size={18} />
                Back to Members
              </Link>
            </div>
          </section>

          {error && (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:gap-6">
            <div className="space-y-5 sm:space-y-6">
              <FormSection
                title="Member Information"
                desc="Add basic profile details for the team member."
                icon={UserCog}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name" required icon={User}>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="theme-input "
                        placeholder="Enter full name"
                      />
                    </div>
                  </Field>

                  <Field label="Email Address" required icon={Mail}>
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
                        placeholder="member@infriva.com"
                        autoComplete="email"
                      />
                    </div>
                  </Field>

                  <Field label="Phone" icon={Phone}>
                    <div className="relative">
                      <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="theme-input"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </Field>

                  <Field label="Password" required icon={Lock}>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      />

                      <input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        className="theme-input  pr-12"
                        placeholder="Minimum 6 characters"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </Field>
                </div>
              </FormSection>

              <FormSection
                title="Access Control"
                desc="Choose CRM role and account status."
                icon={ShieldCheck}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Role" icon={UserCog}>
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
                  </Field>

                  <Field label="Account Status" icon={ShieldCheck}>
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
                  </Field>
                </div>
              </FormSection>

              <div className="hidden flex-col-reverse gap-3 sm:flex sm:flex-row sm:justify-end">
                <Link href="/members" className="theme-btn-outline">
                  Cancel
                </Link>

                <button
                  type="submit"
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

            <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
              <div className="theme-card p-4 sm:p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <ShieldCheck size={24} />
                </div>

                <h2 className="text-lg font-black sm:text-xl">Selected Role</h2>

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
                  Admin can manage full CRM. Ads manager can manage leads and
                  clients. Developer should only work on assigned projects and
                  tasks.
                </p>
              </div>
            </aside>
          </section>

          <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/members"
                className="theme-btn-outline rounded-2xl text-xs"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="theme-btn rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </DashboardLayout>
    </RoleGuard>
  );
}
