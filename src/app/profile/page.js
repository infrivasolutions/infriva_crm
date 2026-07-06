"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
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
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const getRoleLabel = (role = "") => {
  if (role === "admin") return "Admin";
  if (role === "ads-manager") return "Ads Manager";
  if (role === "developer") return "Developer";
  return role || "Member";
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold text-foreground">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await apiFetch("/auth/me");
      const user = res?.user || res?.data;

      if (!user) {
        throw new Error("Profile not found");
      }

      setProfile(user);

      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        currentPassword: "",
        newPassword: "",
      });

      localStorage.setItem("infriva_user", JSON.stringify(user));
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

      setError(err?.message || "Failed to load profile");
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

    fetchProfile();
  }, [router]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      if (form.newPassword && form.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      };

      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const res = await apiFetch("/auth/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedUser = res?.user || res?.data;

      if (updatedUser) {
        setProfile(updatedUser);
        localStorage.setItem("infriva_user", JSON.stringify(updatedUser));
      } else {
        await fetchProfile();
      }

      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));

      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />
            <h2 className="mt-4 text-xl font-black">Loading Profile</h2>
            <p className="mt-2 text-sm text-muted">
              Fetching your account details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Account Settings
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                My Profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                Manage your CRM account details, contact information and
                password.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-primary">
                  {getRoleLabel(profile?.role)}
                </span>

                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${
                    profile?.isActive !== false
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {profile?.isActive !== false ? "Active" : "Inactive"}
                </span>

                <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                  Joined {formatDate(profile?.createdAt)}
                </span>
              </div>
            </div>

            <button
              onClick={fetchProfile}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
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

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Account Overview</h2>
                <p className="mt-1 text-sm text-muted">
                  Your current CRM account information.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem icon={User} label="Name" value={profile?.name} />
                <DetailItem icon={Mail} label="Email" value={profile?.email} />
                <DetailItem icon={Phone} label="Phone" value={profile?.phone} />
                <DetailItem
                  icon={ShieldCheck}
                  label="Role"
                  value={getRoleLabel(profile?.role)}
                />
                <DetailItem
                  icon={ShieldCheck}
                  label="Status"
                  value={profile?.isActive !== false ? "Active" : "Inactive"}
                />
                <DetailItem
                  icon={CalendarClock}
                  label="Created At"
                  value={formatDate(profile?.createdAt)}
                />
              </div>
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-black">Update Profile</h2>
                <p className="mt-1 text-sm text-muted">
                  Update your personal details.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Full Name
                  </label>

                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="theme-input"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="theme-input"
                    placeholder="you@infriva.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black">Phone</label>

                  <input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="theme-input"
                    placeholder="Phone number"
                  />
                </div>
              </div>
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-black">Change Password</h2>
                <p className="mt-1 text-sm text-muted">
                  Leave password fields empty if you do not want to change it.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Current Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={(e) =>
                        updateField("currentPassword", e.target.value)
                      }
                      className="theme-input pl-11 pr-12"
                      placeholder="Current password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={form.newPassword}
                      onChange={(e) =>
                        updateField("newPassword", e.target.value)
                      }
                      className="theme-input pl-11 pr-12"
                      placeholder="Minimum 6 characters"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
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

          <aside className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <ShieldCheck size={24} />
              </div>

              <h2 className="text-xl font-black">Role Access</h2>

              <div className="mt-4 rounded-3xl bg-surface-alt p-4">
                <p className="text-lg font-black text-primary">
                  {getRoleLabel(profile?.role)}
                </p>

                <p className="mt-2 text-sm leading-7 text-muted">
                  Your CRM permissions are managed by admin. Contact admin if
                  you need access changes.
                </p>
              </div>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">
                Security Reminder
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Use a strong password and never share your CRM login details
                with anyone.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
