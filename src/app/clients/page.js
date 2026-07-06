"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  Building2,
  CalendarClock,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) =>
  client?.companyName || client?.company || "No company";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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
        client?.email?.toLowerCase().includes(value)
      );
    });
  }, [clients, search]);

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Client Management
              </p>

              <h1 className="mt-2 text-3xl font-black">Clients</h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage converted clients, contact details, assigned team members
                and project flow.
              </p>
            </div>

            <Link
              href="/clients/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              <Plus size={18} />
              Add Client
            </Link>
          </section>

          <section className="theme-card p-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by client name, company, phone or email..."
                className="theme-input pl-11"
              />
            </div>

            <p className="mt-4 text-sm font-bold text-muted">
              Showing {filteredClients.length} of {clients.length} clients
            </p>
          </section>

          {loading ? (
            <div className="theme-card flex min-h-[360px] items-center justify-center p-8">
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
            <div className="theme-card flex min-h-[320px] items-center justify-center p-8 text-center">
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
            <div className="theme-card flex min-h-[320px] items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Building2 size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">No clients found</h2>
                <p className="mt-2 text-sm text-muted">
                  Converted leads will appear here as clients.
                </p>
              </div>
            </div>
          ) : (
            <section className="grid gap-4">
              {filteredClients.map((client) => (
                <Link
                  key={client._id}
                  href={`/clients/${client._id}`}
                  className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-foreground">
                          {getClientName(client)}
                        </h3>

                        <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-black text-primary">
                          Client
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-primary">
                        {getCompanyName(client)}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                        {client?.phone && (
                          <span className="inline-flex items-center gap-2">
                            <Phone size={15} />
                            {client.phone}
                          </span>
                        )}

                        {client?.email && (
                          <span className="inline-flex items-center gap-2">
                            <Mail size={15} />
                            {client.email}
                          </span>
                        )}

                        <span className="inline-flex items-center gap-2">
                          <CalendarClock size={15} />
                          Added {formatDate(client.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {client?.assignedTo?.name && (
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                          Assigned: {client.assignedTo.name}
                        </span>
                      )}

                      {client?.lead && (
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                          Converted Lead
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
