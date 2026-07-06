"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const statuses = [
  "All",
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

const sources = [
  "All",
  "Website",
  "Meta Ads",
  "Manual",
  "WhatsApp",
  "Referral",
  "Other",
];

const priorities = ["All", "Hot", "Warm", "Cold"];

const getStatusClass = (status = "") => {
  if (status === "Won") return "bg-green-50 text-green-700";
  if (status === "Lost") return "bg-red-50 text-red-700";
  if (status === "Proposal Sent") return "bg-amber-50 text-amber-700";
  if (status === "Contacted" || status === "Qualified") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-primary-light text-primary";
};

const getPriorityClass = (priority = "") => {
  if (priority === "Hot") return "bg-red-50 text-red-700";
  if (priority === "Cold") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [source, setSource] = useState("All");
  const [priority, setPriority] = useState("All");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/leads");
      setLeads(res?.leads || res?.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        lead?.clientName?.toLowerCase().includes(searchValue) ||
        lead?.phone?.toLowerCase().includes(searchValue) ||
        lead?.email?.toLowerCase().includes(searchValue) ||
        lead?.company?.toLowerCase().includes(searchValue) ||
        lead?.service?.toLowerCase().includes(searchValue);

      const matchesStatus = status === "All" || lead.status === status;
      const matchesSource = source === "All" || lead.source === source;
      const matchesPriority = priority === "All" || lead.priority === priority;

      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
  }, [leads, search, status, source, priority]);

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Lead Management
              </p>
              <h1 className="mt-2 text-3xl font-black">Leads</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Manage website enquiries, Meta Ads leads, WhatsApp leads,
                referrals and manual business leads.
              </p>
            </div>

            <Link
              href="/leads/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              <Plus size={18} />
              Add Lead
            </Link>
          </section>

          <section className="theme-card p-4">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, company, service..."
                  className="theme-input pl-11"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="theme-input"
              >
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="theme-input"
              >
                {sources.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="theme-input"
              >
                {priorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
              <SlidersHorizontal size={16} />
              Showing {filteredLeads.length} of {leads.length} leads
            </div>
          </section>

          {loading ? (
            <div className="theme-card flex min-h-90 items-center justify-center p-8">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-primary"
                  size={36}
                />
                <h2 className="mt-4 text-xl font-black">Loading leads</h2>
                <p className="mt-2 text-sm text-muted">
                  Fetching latest CRM leads...
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
                <button onClick={fetchLeads} className="theme-btn mt-5">
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <User size={26} />
                </div>
                <h2 className="mt-4 text-xl font-black">No leads found</h2>
                <p className="mt-2 text-sm text-muted">
                  Add a new lead or change your filters.
                </p>
                <Link href="/leads/new" className="theme-btn mt-5">
                  Add First Lead
                </Link>
              </div>
            </div>
          ) : (
            <section className="grid gap-4">
              {filteredLeads.map((lead) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-foreground">
                          {lead.clientName}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                            lead.status,
                          )}`}
                        >
                          {lead.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${getPriorityClass(
                            lead.priority,
                          )}`}
                        >
                          {lead.priority}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-primary">
                        {lead.service}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                        <span className="inline-flex items-center gap-2">
                          <Phone size={15} />
                          {lead.phone}
                        </span>

                        {lead.email && (
                          <span className="inline-flex items-center gap-2">
                            <Mail size={15} />
                            {lead.email}
                          </span>
                        )}

                        {lead.followUpDate && (
                          <span className="inline-flex items-center gap-2">
                            <CalendarClock size={15} />
                            Follow-up:{" "}
                            {new Date(lead.followUpDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                        {lead.source}
                      </span>

                      {lead.budget && (
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                          Budget: {lead.budget}
                        </span>
                      )}

                      {lead.company && (
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                          {lead.company}
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
