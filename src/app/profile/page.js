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
const getRoleClass = (role = "") => {
  if (role === "admin") return "bg-primary-light text-primary";
  if (role === "ads-manager") return "bg-blue-50 text-blue-700";
  if (role === "developer") return "bg-green-50 text-green-700";
  return "bg-white text-primary";
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
    <div className="group rounded-3xl border border-border bg-surface-alt p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-purple-100 sm:p-4">
      {" "}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {" "}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm group-hover:bg-primary group-hover:text-white">
          {" "}
          <Icon size={18} />{" "}
        </div>{" "}
        <div className="min-w-0">
          {" "}
          <p className="text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {" "}
            {label}{" "}
          </p>{" "}
          <p className="mt-1 wrap-break-word text-xs font-black text-foreground sm:text-sm">
            {" "}
            {value || "—"}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="theme-card p-4 sm:p-6">
      {" "}
      <div className="mb-5 flex items-start justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h2 className="text-lg font-black text-foreground sm:text-xl">
            {" "}
            {title}{" "}
          </h2>{" "}
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
            {" "}
            {desc}{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          {" "}
          <Icon size={22} />{" "}
        </div>{" "}
      </div>{" "}
      {children}{" "}
    </section>
  );
}
function Field({ label, icon: Icon, children }) {
  return (
    <div>
      {" "}
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
        {" "}
        {Icon && <Icon size={15} className="text-primary" />} {label}{" "}
      </label>{" "}
      {children}{" "}
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
      if (form.newPassword && form.newPassword.length < 6) {
        throw new Error("New password must be at least 6 characters");
      }
      if (form.newPassword && !form.currentPassword.trim()) {
        throw new Error("Current password is required to change password");
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
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
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
        {" "}
        <div className="flex min-h-[70vh] items-center justify-center">
          {" "}
          <div className="theme-card flex flex-col items-center p-8 text-center">
            {" "}
            <Loader2 className="animate-spin text-primary" size={36} />{" "}
            <h2 className="mt-4 text-xl font-black">Loading Profile</h2>{" "}
            <p className="mt-2 text-sm text-muted">
              {" "}
              Fetching your account details...{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-5 sm:space-y-6">
        {" "}
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          {" "}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            {" "}
            <div className="min-w-0">
              {" "}
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                {" "}
                Account Settings{" "}
              </p>{" "}
              <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                {" "}
                My Profile{" "}
              </h1>{" "}
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {" "}
                Manage your CRM account details, contact information and
                password.{" "}
              </p>{" "}
              <div className="mt-5 flex flex-wrap gap-2">
                {" "}
                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getRoleClass(profile?.role)}`}
                >
                  {" "}
                  {getRoleLabel(profile?.role)}{" "}
                </span>{" "}
                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${profile?.isActive !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                >
                  {" "}
                  {profile?.isActive !== false ? "Active" : "Inactive"}{" "}
                </span>{" "}
                <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                  {" "}
                  Joined {formatDate(profile?.createdAt)}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <button
              type="button"
              onClick={fetchProfile}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
            >
              {" "}
              <RefreshCcw size={18} /> Refresh{" "}
            </button>{" "}
          </div>{" "}
        </section>{" "}
        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {" "}
            <AlertCircle size={18} className="shrink-0" />{" "}
            <span>{error}</span>{" "}
          </div>
        )}{" "}
        {success && (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {" "}
            {success}{" "}
          </div>
        )}{" "}
        <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr] xl:gap-6">
          {" "}
          <div className="space-y-5 sm:space-y-6">
            {" "}
            <FormSection
              title="Account Overview"
              desc="Your current CRM account information."
              icon={User}
            >
              {" "}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                {" "}
                <DetailItem
                  icon={User}
                  label="Name"
                  value={profile?.name}
                />{" "}
                <DetailItem icon={Mail} label="Email" value={profile?.email} />{" "}
                <DetailItem icon={Phone} label="Phone" value={profile?.phone} />{" "}
                <DetailItem
                  icon={ShieldCheck}
                  label="Role"
                  value={getRoleLabel(profile?.role)}
                />{" "}
                <DetailItem
                  icon={ShieldCheck}
                  label="Status"
                  value={profile?.isActive !== false ? "Active" : "Inactive"}
                />{" "}
                <DetailItem
                  icon={CalendarClock}
                  label="Created At"
                  value={formatDate(profile?.createdAt)}
                />{" "}
              </div>{" "}
            </FormSection>{" "}
            <FormSection
              title="Update Profile"
              desc="Update your personal details."
              icon={User}
            >
              {" "}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {" "}
                <Field label="Full Name" icon={User}>
                  {" "}
                  <input
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="theme-input"
                    placeholder="Your name"
                  />{" "}
                </Field>{" "}
                <Field label="Email Address" icon={Mail}>
                  {" "}
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="theme-input"
                    placeholder="you@infriva.com"
                  />{" "}
                </Field>{" "}
                <Field label="Phone" icon={Phone}>
                  {" "}
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="theme-input"
                    placeholder="Phone number"
                  />{" "}
                </Field>{" "}
              </div>{" "}
            </FormSection>{" "}
            <FormSection
              title="Change Password"
              desc="Leave password fields empty if you do not want to change it."
              icon={Lock}
            >
              {" "}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {" "}
                <Field label="Current Password" icon={Lock}>
                  {" "}
                  <div className="relative">
                    {" "}
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />{" "}
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={form.currentPassword}
                      onChange={(e) =>
                        updateField("currentPassword", e.target.value)
                      }
                      className="theme-input pl-11 pr-12"
                      placeholder="Current password"
                    />{" "}
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                    >
                      {" "}
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}{" "}
                    </button>{" "}
                  </div>{" "}
                </Field>{" "}
                <Field label="New Password" icon={Lock}>
                  {" "}
                  <div className="relative">
                    {" "}
                    <Lock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />{" "}
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={form.newPassword}
                      onChange={(e) =>
                        updateField("newPassword", e.target.value)
                      }
                      className="theme-input pl-11 pr-12"
                      placeholder="Minimum 6 characters"
                    />{" "}
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-primary"
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {" "}
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}{" "}
                    </button>{" "}
                  </div>{" "}
                </Field>{" "}
              </div>{" "}
              <div className="mt-6 hidden justify-end sm:flex">
                {" "}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="theme-btn disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {" "}
                  {saving ? (
                    <>
                      {" "}
                      <Loader2 size={18} className="animate-spin" />{" "}
                      Saving...{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Save size={18} /> Save Changes{" "}
                    </>
                  )}
                </button>
              </div>
            </FormSection>
          </div>
          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-lg font-black sm:text-xl">Role Access</h2>
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
        <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
          {" "}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="theme-btn w-full rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {" "}
            {saving ? (
              <>
                {" "}
                <Loader2 size={16} className="animate-spin" /> Saving{" "}
              </>
            ) : (
              <>
                {" "}
                <Save size={16} /> Save Changes{" "}
              </>
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
