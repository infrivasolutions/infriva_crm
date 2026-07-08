"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

const getRoleLabel = (role = "") => {
  if (role === "admin") return "Admin";
  if (role === "ads-manager") return "Ads Manager";
  if (role === "developer") return "Developer";
  return role || "Member";
};

const getRoleClass = (role = "") => {
  if (role === "admin") return "bg-primary-light text-primary";
  if (role === "ads-manager") return "bg-blue-50 text-blue-700";
  if (role === "developer") return "bg-green-50 text-green-700";
  return "bg-surface-alt text-foreground";
};

const formatDate = (date) => {
  if (!date) return "—";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-border bg-surface-alt p-3 transition hover:bg-white hover:shadow-lg hover:shadow-purple-100 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {label}
          </p>

          <p className="mt-1 wrap-break-word text-xs font-black text-foreground sm:text-sm">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, icon: Icon }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
        {Icon && <Icon size={15} className="text-primary" />}
        {label}
      </label>

      {children}
    </div>
  );
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params?.id;

  const [member, setMember] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "developer",
    isActive: true,
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMember = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await apiFetch(`/users/${memberId}`);
      const memberData = res?.user || res?.data;

      if (!memberData) {
        throw new Error("Member not found");
      }

      setMember(memberData);

      setForm({
        name: memberData?.name || "",
        email: memberData?.email || "",
        phone: memberData?.phone || "",
        role: memberData?.role || "developer",
        isActive: memberData?.isActive !== false,
        password: "",
      });
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

      setError(err?.message || "Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (memberId) {
      fetchMember();
    }
  }, [memberId, router]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        throw new Error("Name is required");
      }

      if (!form.email.trim()) {
        throw new Error("Email is required");
      }

      if (form.password && form.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        isActive: form.isActive,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const res = await apiFetch(`/users/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedMember = res?.user || res?.data;

      if (updatedMember) {
        setMember(updatedMember);
      } else {
        await fetchMember();
      }

      setForm((prev) => ({ ...prev, password: "" }));
      setSuccess("Member updated successfully");
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

      setError(err?.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this member?",
      );

      if (!confirmDelete) return;

      setDeleting(true);
      setError("");
      setSuccess("");

      await apiFetch(`/users/${memberId}`, { method: "DELETE" });

      router.push("/members");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  };

  const selectedRole = useMemo(() => {
    return roleOptions.find((item) => item.value === form.role);
  }, [form.role]);

  if (loading) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <DashboardLayout>
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="theme-card flex flex-col items-center p-8 text-center">
              <Loader2 className="animate-spin text-primary" size={36} />

              <h2 className="mt-4 text-xl font-black">Loading Member</h2>

              <p className="mt-2 text-sm text-muted">
                Fetching team member details...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (error && !member) {
    return (
      <RoleGuard allowedRoles={["admin"]}>
        <DashboardLayout>
          <div className="flex min-h-[70vh] items-center justify-center">
            <div className="theme-card max-w-md p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">Member Error</h2>

              <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

              <div className="mt-5 flex justify-center gap-3">
                <Link href="/members" className="theme-btn-outline">
                  Back
                </Link>

                <button
                  type="button"
                  onClick={fetchMember}
                  className="theme-btn"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div className="min-w-0">
                <Link
                  href="/members"
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
                >
                  <ArrowLeft size={17} />
                  Back to Members
                </Link>

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  Member Detail
                </p>

                <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                  {member?.name || "Unnamed Member"}
                </h1>

                <p className="mt-3 max-w-2xl wrap-break-word text-sm leading-7 text-white/75">
                  {member?.email || "No email added"}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getRoleClass(
                      member?.role,
                    )}`}
                  >
                    {getRoleLabel(member?.role)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${
                      member?.isActive !== false
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {member?.isActive !== false ? "Active" : "Inactive"}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    Joined {formatDate(member?.createdAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchMember}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:w-fit sm:rounded-full"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </section>

          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              {success}
            </div>
          )}

          <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr] xl:gap-6">
            <div className="space-y-5 sm:space-y-6">
              <div className="theme-card p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black sm:text-xl">
                      Member Information
                    </h2>

                    <p className="mt-1 text-xs text-muted sm:text-sm">
                      Basic team member details
                    </p>
                  </div>

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <UserCog size={22} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                  <DetailItem icon={User} label="Name" value={member?.name} />

                  <DetailItem icon={Mail} label="Email" value={member?.email} />

                  <DetailItem
                    icon={Phone}
                    label="Phone"
                    value={member?.phone}
                  />

                  <DetailItem
                    icon={ShieldCheck}
                    label="Role"
                    value={getRoleLabel(member?.role)}
                  />

                  <DetailItem
                    icon={ShieldCheck}
                    label="Status"
                    value={member?.isActive !== false ? "Active" : "Inactive"}
                  />

                  <DetailItem
                    icon={CalendarClock}
                    label="Created At"
                    value={formatDate(member?.createdAt)}
                  />
                </div>
              </div>

              <div className="theme-card p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-black sm:text-xl">
                    Update Member
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Edit profile, role, active status or reset password.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name" icon={User}>
                    <input
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="theme-input"
                      placeholder="Member name"
                    />
                  </Field>

                  <Field label="Email Address" icon={Mail}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className="theme-input"
                      placeholder="member@infriva.com"
                    />
                  </Field>

                  <Field label="Phone" icon={Phone}>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="theme-input"
                      placeholder="Phone number"
                    />
                  </Field>

                  <Field label="Role" icon={ShieldCheck}>
                    <select
                      value={form.role}
                      onChange={(e) => updateField("role", e.target.value)}
                      className="theme-input"
                    >
                      {roleOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
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

                  <Field label="New Password" icon={Lock}>
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
                        className="theme-input pl-11 pr-12"
                        placeholder="Leave blank to keep current"
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

                <div className="mt-6 hidden flex-col-reverse gap-3 sm:flex sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-red-100 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Delete
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="theme-btn disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
              <div className="theme-card p-4 sm:p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <ShieldCheck size={24} />
                </div>

                <h2 className="text-lg font-black sm:text-xl">Role Access</h2>

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
                <p className="text-sm font-black text-primary">
                  Member Reminder
                </p>

                <p className="mt-2 text-sm leading-7 text-muted">
                  Deactivating a member is safer than deleting if they have
                  assigned tasks or project history.
                </p>
              </div>
            </aside>
          </section>

          <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="theme-btn rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
