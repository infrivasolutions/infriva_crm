"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) =>
  client?.companyName ||
  client?.company ||
  client?.businessName ||
  "No company";

const getAssignedName = (client) =>
  client?.assignedTo?.name || client?.assignedTo?.email || "";

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

function SummaryCard({ title, value, desc, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary sm:h-12 sm:w-12">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-3 truncate text-xs font-semibold text-muted sm:text-sm">
        {desc}
      </p>
    </div>
  );
}

function ClientCard({ client }) {
  const clientId = client?._id || client?.id;

  return (
    <Link
      href={`/clients/${clientId}`}
      className="group block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-purple-100"
    >
      <div className="relative bg-primary-light p-3 sm:p-4">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl" />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-primary sm:h-11 sm:w-11">
              <Building2 size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xs font-black text-foreground sm:text-base">
                {getClientName(client)}
              </h3>

              <p className="mt-1 truncate text-[10px] font-bold text-primary sm:text-xs">
                {getCompanyName(client)}
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[9px] font-black text-green-700 sm:px-3 sm:text-[11px]">
            Client
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="space-y-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted sm:text-[10px]">
              Contact
            </p>

            <div className="mt-2 space-y-2">
              {client?.phone && (
                <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
                  <Phone size={13} className="shrink-0 text-primary" />
                  <span className="truncate">{client.phone}</span>
                </p>
              )}

              {client?.email && (
                <p className="hidden min-w-0 items-center gap-2 text-xs font-bold text-muted sm:flex">
                  <Mail size={13} className="shrink-0 text-primary" />
                  <span className="truncate">{client.email}</span>
                </p>
              )}

              {!client?.phone && !client?.email && (
                <p className="text-[10px] font-bold text-muted sm:text-xs">
                  No contact added
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-surface-alt p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-muted sm:text-[10px]">
                  Added
                </p>

                <p className="mt-1 text-[11px] font-black text-foreground sm:text-xs">
                  {formatDate(client?.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-muted sm:text-[10px]">
                  Assigned
                </p>

                <p className="mt-1 truncate text-[11px] font-black text-foreground sm:text-xs">
                  {getAssignedName(client) || "Not assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {client?.lead && (
            <span className="rounded-full bg-primary-light px-2 py-1 text-[9px] font-black text-primary sm:px-3 sm:text-[11px]">
              Converted Lead
            </span>
          )}

          {getAssignedName(client) && (
            <span className="rounded-full bg-surface-alt px-2 py-1 text-[9px] font-black text-foreground sm:px-3 sm:text-[11px]">
              Team Assigned
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] font-black text-primary sm:text-xs">
          <span>View Details</span>

          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/clients");
      setClients(res?.clients || res?.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    const value = search.toLowerCase();

    return clients.filter((client) => {
      return (
        getClientName(client).toLowerCase().includes(value) ||
        getCompanyName(client).toLowerCase().includes(value) ||
        client?.phone?.toLowerCase().includes(value) ||
        client?.email?.toLowerCase().includes(value) ||
        getAssignedName(client).toLowerCase().includes(value)
      );
    });
  }, [clients, search]);

  const summaryCards = useMemo(() => {
    const assignedClients = clients.filter((client) => getAssignedName(client));
    const convertedClients = clients.filter((client) => client?.lead);

    return [
      {
        title: "Total Clients",
        value: clients.length,
        desc: "All converted clients",
        icon: Users,
      },
      {
        title: "Showing",
        value: filteredClients.length,
        desc: "After search",
        icon: SlidersHorizontal,
      },
      {
        title: "Assigned",
        value: assignedClients.length,
        desc: "Team assigned",
        icon: User,
      },
      {
        title: "Converted",
        value: convertedClients.length,
        desc: "From leads",
        icon: CheckCircle2,
      },
    ];
  }, [clients, filteredClients]);

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  Client Management
                </p>

                <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  Clients
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  Manage converted clients, contact details, assigned team
                  members and project flow.
                </p>
              </div>

              <Link
                href="/clients/new"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
              >
                <Plus size={18} />
                Add Client
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </section>

          <section className="theme-card p-4 sm:p-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client, company, phone..."
                className="theme-input pl-11"
              />
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted sm:text-sm">
              <SlidersHorizontal size={16} />
              Showing {filteredClients.length} of {clients.length} clients
            </p>
          </section>

          {loading ? (
            <div className="theme-card flex min-h-90 items-center justify-center p-8">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-primary"
                  size={36}
                />

                <h2 className="mt-4 text-xl font-black">Loading clients</h2>

                <p className="mt-2 text-sm text-muted">
                  Fetching latest CRM clients...
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

                <button onClick={fetchClients} className="theme-btn mt-5">
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Building2 size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">No clients found</h2>

                <p className="mt-2 text-sm text-muted">
                  Converted leads will appear here as clients.
                </p>

                <Link href="/clients/new" className="theme-btn mt-5">
                  Add Client
                </Link>
              </div>
            </div>
          ) : (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Client Cards
                  </h2>

                  <p className="text-xs font-semibold text-muted sm:text-sm">
                    Mobile friendly client view
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredClients.map((client) => (
                  <ClientCard key={client._id || client.id} client={client} />
                ))}
              </div>
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
