"use client";
import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
const roleOptions = ["All", "admin", "ads-manager", "developer"];
const statusOptions = ["All", "Active", "Inactive"];
const getMemberName = (member) =>
  member?.name || member?.fullName || "Unnamed Member";
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
function StatCard({ title, value, desc, icon: Icon, tone = "primary" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-700 shadow-green-100"
      : tone === "blue"
        ? "bg-blue-50 text-blue-700 shadow-blue-100"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 shadow-amber-100"
          : "bg-primary-light text-primary shadow-purple-100";
  return (
    <div className="group relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100 sm:rounded-3xl sm:p-5">
      {" "}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />{" "}
      <div className="relative flex items-start justify-between gap-3">
        {" "}
        <div className="min-w-0">
          {" "}
          <p className="truncate text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {" "}
            {title}{" "}
          </p>{" "}
          <h3 className="mt-2 text-2xl font-black leading-none text-foreground sm:text-3xl">
            {" "}
            {value}{" "}
          </h3>{" "}
          <p className="mt-3 truncate text-[10px] font-bold text-muted sm:text-sm">
            {" "}
            {desc}{" "}
          </p>{" "}
        </div>{" "}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg sm:h-12 sm:w-12 ${toneClass}`}
        >
          {" "}
          <Icon size={21} />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
function MemberCard({ member }) {
  const active = member?.isActive !== false;
  const memberId = member?._id || member?.id;
  return (
    <Link
      href={`/members/${memberId}`}
      className="group relative block overflow-hidden rounded-[1.7rem] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-purple-100 sm:rounded-3xl"
    >
      {" "}
      <div className="relative overflow-hidden bg-primary-light p-3 sm:p-4">
        {" "}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />{" "}
        <div className="absolute -bottom-12 left-8 h-20 w-20 rounded-full bg-white/60 blur-2xl" />{" "}
        <div className="relative flex items-start justify-between gap-2">
          {" "}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {" "}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-purple-100 sm:h-12 sm:w-12">
              {" "}
              <UserCog size={19} />{" "}
            </div>{" "}
            <div className="min-w-0">
              {" "}
              <h3 className="truncate text-xs font-black text-foreground sm:text-base">
                {" "}
                {getMemberName(member)}{" "}
              </h3>{" "}
              <p className="mt-1 truncate text-[10px] font-black text-primary sm:text-xs">
                {" "}
                {getRoleLabel(member?.role)}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {" "}
            {active ? "Active" : "Inactive"}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      <div className="p-3 sm:p-4">
        {" "}
        <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          {" "}
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getRoleClass(member?.role)}`}
          >
            {" "}
            {getRoleLabel(member?.role)}{" "}
          </span>{" "}
          <span className="rounded-full bg-surface-alt px-2 py-1 text-[9px] font-black text-foreground sm:px-3 sm:text-[11px]">
            {" "}
            Joined {formatDate(member?.createdAt)}{" "}
          </span>{" "}
        </div>{" "}
        <div className="space-y-2 rounded-2xl bg-surface-alt p-3">
          {" "}
          {member?.email && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              {" "}
              <Mail size={13} className="shrink-0 text-primary" />{" "}
              <span className="truncate">{member.email}</span>{" "}
            </p>
          )}{" "}
          {member?.phone && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              {" "}
              <Phone size={13} className="shrink-0 text-primary" />{" "}
              <span className="truncate">{member.phone}</span>{" "}
            </p>
          )}{" "}
          {!member?.email && !member?.phone && (
            <p className="text-[10px] font-bold text-muted sm:text-xs">
              {" "}
              No contact added{" "}
            </p>
          )}{" "}
        </div>{" "}
        <div className="mt-4 flex items-center justify-between text-[10px] font-black text-primary sm:text-xs">
          {" "}
          <span>View Details</span>{" "}
          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />{" "}
        </div>{" "}
      </div>{" "}
    </Link>
  );
}
export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/users");
      setMembers(res?.users || res?.data || []);
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
      setError(err?.message || "Failed to fetch members");
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
    fetchMembers();
  }, [router]);
  const filteredMembers = useMemo(() => {
    const value = search.toLowerCase();
    return members.filter((member) => {
      const matchesSearch =
        getMemberName(member).toLowerCase().includes(value) ||
        member?.email?.toLowerCase().includes(value) ||
        member?.phone?.toLowerCase().includes(value) ||
        member?.role?.toLowerCase().includes(value);
      const matchesRole = role === "All" || member?.role === role;
      const memberActive = member?.isActive !== false;
      const matchesStatus =
        status === "All" ||
        (status === "Active" && memberActive) ||
        (status === "Inactive" && !memberActive);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, search, role, status]);
  const stats = useMemo(() => {
    return {
      total: members.length,
      active: members.filter((member) => member?.isActive !== false).length,
      developers: members.filter((member) => member?.role === "developer")
        .length,
      adsManagers: members.filter((member) => member?.role === "ads-manager")
        .length,
    };
  }, [members]);
  const statCards = [
    {
      title: "Total Members",
      value: stats.total,
      desc: "All team users",
      icon: Users,
      tone: "primary",
    },
    {
      title: "Active",
      value: stats.active,
      desc: "Active access",
      icon: ShieldCheck,
      tone: "green",
    },
    {
      title: "Developers",
      value: stats.developers,
      desc: "Delivery team",
      icon: UserCog,
      tone: "blue",
    },
    {
      title: "Ads Managers",
      value: stats.adsManagers,
      desc: "Lead managers",
      icon: ShieldCheck,
      tone: "amber",
    },
  ];
  return (
    <RoleGuard allowedRoles={["admin"]}>
      {" "}
      <DashboardLayout>
        {" "}
        <div className="space-y-5 sm:space-y-6">
          {" "}
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            {" "}
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
            <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              {" "}
              <div className="min-w-0">
                {" "}
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  {" "}
                  Team Management{" "}
                </p>{" "}
                <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  {" "}
                  Members{" "}
                </h1>{" "}
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  {" "}
                  Manage admins, ads managers and developers with role-based CRM
                  access.{" "}
                </p>{" "}
              </div>{" "}
              <Link
                href="/members/new"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
              >
                {" "}
                <Plus size={18} /> Add Member{" "}
              </Link>{" "}
            </div>{" "}
          </section>{" "}
          {/* 2-column cards on mobile */}{" "}
          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {" "}
            {statCards.map((item) => (
              <StatCard key={item.title} {...item} />
            ))}{" "}
          </section>{" "}
          <section className="theme-card p-4 sm:p-5">
            {" "}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
              {" "}
              <div className="relative col-span-2 lg:col-span-1">
                {" "}
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />{" "}
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone..."
                  className="theme-input pl-12"
                />{" "}
              </div>{" "}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="theme-input text-sm"
              >
                {" "}
                {roleOptions.map((item) => (
                  <option key={item} value={item}>
                    {" "}
                    {item === "All" ? "All Roles" : getRoleLabel(item)}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="theme-input text-sm"
              >
                {" "}
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {" "}
                    {item}{" "}
                  </option>
                ))}{" "}
              </select>{" "}
            </div>{" "}
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted sm:text-sm">
              {" "}
              <SlidersHorizontal size={16} /> Showing {filteredMembers.length}{" "}
              of {members.length} members{" "}
            </div>{" "}
          </section>{" "}
          {loading ? (
            <div className="theme-card flex min-h-90 items-center justify-center p-8">
              {" "}
              <div className="text-center">
                {" "}
                <Loader2
                  className="mx-auto animate-spin text-primary"
                  size={36}
                />{" "}
                <h2 className="mt-4 text-xl font-black">Loading members</h2>{" "}
                <p className="mt-2 text-sm text-muted">
                  {" "}
                  Fetching latest team members...{" "}
                </p>{" "}
              </div>{" "}
            </div>
          ) : error ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              {" "}
              <div>
                {" "}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  {" "}
                  <AlertCircle size={26} />{" "}
                </div>{" "}
                <h2 className="mt-4 text-xl font-black">Error</h2>{" "}
                <p className="mt-2 text-sm text-muted">{error}</p>{" "}
                <button onClick={fetchMembers} className="theme-btn mt-5">
                  {" "}
                  Try Again{" "}
                </button>{" "}
              </div>{" "}
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              {" "}
              <div>
                {" "}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  {" "}
                  <UserCog size={26} />{" "}
                </div>{" "}
                <h2 className="mt-4 text-xl font-black">No members found</h2>{" "}
                <p className="mt-2 text-sm text-muted">
                  {" "}
                  Add your team members to manage CRM access.{" "}
                </p>{" "}
                <Link href="/members/new" className="theme-btn mt-5">
                  {" "}
                  Add Member{" "}
                </Link>{" "}
              </div>{" "}
            </div>
          ) : (
            <section>
              {" "}
              <div className="mb-3 flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h2 className="text-lg font-black text-foreground">
                    {" "}
                    Team Members{" "}
                  </h2>{" "}
                  <p className="text-xs font-semibold text-muted sm:text-sm">
                    {" "}
                    Attractive 2-column member grid{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              {/* 2-column cards on mobile */}{" "}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {" "}
                {filteredMembers.map((member) => (
                  <MemberCard key={member._id || member.id} member={member} />
                ))}{" "}
              </div>{" "}
            </section>
          )}{" "}
        </div>{" "}
      </DashboardLayout>{" "}
    </RoleGuard>
  );
}
