"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
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

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Team Management
              </p>

              <h1 className="mt-2 text-3xl font-black">Members</h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage admins, ads managers and developers with role-based CRM
                access.
              </p>
            </div>

            <Link
              href="/members/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              <Plus size={18} />
              Add Member
            </Link>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Total Members</p>
                  <h3 className="mt-2 text-3xl font-black">{stats.total}</h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Users size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Active Members</p>
                  <h3 className="mt-2 text-3xl font-black">{stats.active}</h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                  <ShieldCheck size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Developers</p>
                  <h3 className="mt-2 text-3xl font-black">
                    {stats.developers}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <UserCog size={22} />
                </div>
              </div>
            </div>

            <div className="theme-card-soft p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-muted">Ads Managers</p>
                  <h3 className="mt-2 text-3xl font-black">
                    {stats.adsManagers}
                  </h3>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <ShieldCheck size={22} />
                </div>
              </div>
            </div>
          </section>

          <section className="theme-card p-4">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, phone or role..."
                  className="theme-input pl-12"
                />
              </div>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="theme-input"
              >
                {roleOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Roles" : getRoleLabel(item)}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="theme-input"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
              <SlidersHorizontal size={16} />
              Showing {filteredMembers.length} of {members.length} members
            </div>
          </section>

          {loading ? (
            <div className="theme-card flex min-h-90 items-center justify-center p-8">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-primary"
                  size={36}
                />
                <h2 className="mt-4 text-xl font-black">Loading members</h2>
                <p className="mt-2 text-sm text-muted">
                  Fetching latest team members...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">Error</h2>
                <p className="mt-2 text-sm text-muted">{error}</p>

                <button onClick={fetchMembers} className="theme-btn mt-5">
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <UserCog size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">No members found</h2>
                <p className="mt-2 text-sm text-muted">
                  Add your team members to manage CRM access.
                </p>

                <Link href="/members/new" className="theme-btn mt-5">
                  Add Member
                </Link>
              </div>
            </div>
          ) : (
            <section className="grid gap-4">
              {filteredMembers.map((member) => {
                const active = member?.isActive !== false;

                return (
                  <Link
                    key={member._id}
                    href={`/members/${member._id}`}
                    className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-black text-foreground">
                            {getMemberName(member)}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getRoleClass(
                              member?.role,
                            )}`}
                          >
                            {getRoleLabel(member?.role)}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              active
                                ? "bg-green-50 text-green-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                          {member?.email && (
                            <span className="inline-flex items-center gap-2">
                              <Mail size={15} />
                              {member.email}
                            </span>
                          )}

                          {member?.phone && (
                            <span className="inline-flex items-center gap-2">
                              <Phone size={15} />
                              {member.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                          Joined {formatDate(member.createdAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
