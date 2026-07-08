"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Flame,
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

const getLeadName = (lead) =>
  lead?.clientName || lead?.name || lead?.fullName || "Unnamed Lead";

const getLeadService = (lead) =>
  lead?.service ||
  lead?.serviceInterested ||
  lead?.serviceRequired ||
  lead?.requirement ||
  "Not specified";

const getLeadSource = (lead) =>
  lead?.source || lead?.leadSource || lead?.lead_source || "Manual";

const getLeadCompany = (lead) =>
  lead?.company || lead?.companyName || lead?.businessName || "";

const getLeadStatus = (lead) => lead?.status || "New";

const getLeadPriority = (lead) => lead?.priority || "Warm";

const getStatusClass = (status = "") => {
  const value = status.toLowerCase();

  if (value.includes("won") || value.includes("converted")) {
    return "bg-green-50 text-green-700";
  }

  if (value.includes("lost")) {
    return "bg-red-50 text-red-700";
  }

  if (value.includes("proposal")) {
    return "bg-amber-50 text-amber-700";
  }

  if (value.includes("contacted") || value.includes("qualified")) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-primary-light text-primary";
};

const getPriorityClass = (priority = "") => {
  if (priority === "Hot") return "bg-red-50 text-red-700";
  if (priority === "Cold") return "bg-blue-50 text-blue-700";
  return "bg-amber-50 text-amber-700";
};

function SummaryCard({ title, value, icon: Icon, desc }) {
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

function LeadCard({ lead }) {
  const leadId = lead?._id || lead?.id;

  return (
    <Link
      href={`/leads/${leadId}`}
      className="group block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-purple-100"
    >
      <div className="relative bg-primary-light p-3 sm:p-4">
        <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/10 blur-xl" />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-primary sm:h-11 sm:w-11">
              <User size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xs font-black text-foreground sm:text-base">
                {getLeadName(lead)}
              </h3>
              <p className="mt-1 truncate text-[10px] font-bold text-primary sm:text-xs">
                {getLeadSource(lead)}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getPriorityClass(
              getLeadPriority(lead),
            )}`}
          >
            {getLeadPriority(lead)}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getStatusClass(
              getLeadStatus(lead),
            )}`}
          >
            {getLeadStatus(lead)}
          </span>

          {lead?.budget && (
            <span className="rounded-full bg-surface-alt px-2 py-1 text-[9px] font-black text-foreground sm:px-3 sm:text-[11px]">
              {lead.budget}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-muted sm:text-[10px]">
              Service
            </p>
            <p className="mt-1 truncate text-[11px] font-black text-foreground sm:text-sm">
              {getLeadService(lead)}
            </p>
          </div>

          {getLeadCompany(lead) && (
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-muted sm:text-[10px]">
                Company
              </p>
              <p className="mt-1 truncate text-[11px] font-bold text-foreground sm:text-sm">
                {getLeadCompany(lead)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3">
          {lead?.phone && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              <Phone size={13} className="shrink-0 text-primary" />
              <span className="truncate">{lead.phone}</span>
            </p>
          )}

          {lead?.email && (
            <p className="hidden min-w-0 items-center gap-2 text-xs font-bold text-muted sm:flex">
              <Mail size={13} className="shrink-0 text-primary" />
              <span className="truncate">{lead.email}</span>
            </p>
          )}

          {lead?.followUpDate && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              <CalendarClock size={13} className="shrink-0 text-primary" />
              <span className="truncate">
                {new Date(lead.followUpDate).toLocaleDateString("en-IN")}
              </span>
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px] font-black text-primary sm:text-xs">
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
        getLeadName(lead).toLowerCase().includes(searchValue) ||
        lead?.phone?.toLowerCase().includes(searchValue) ||
        lead?.email?.toLowerCase().includes(searchValue) ||
        getLeadCompany(lead).toLowerCase().includes(searchValue) ||
        getLeadService(lead).toLowerCase().includes(searchValue);

      const matchesStatus = status === "All" || getLeadStatus(lead) === status;
      const matchesSource = source === "All" || getLeadSource(lead) === source;
      const matchesPriority =
        priority === "All" || getLeadPriority(lead) === priority;

      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
  }, [leads, search, status, source, priority]);

  const summaryCards = useMemo(() => {
    const hotLeads = leads.filter((lead) => getLeadPriority(lead) === "Hot");
    const wonLeads = leads.filter((lead) => getLeadStatus(lead) === "Won");

    return [
      {
        title: "Total Leads",
        value: leads.length,
        desc: "All enquiries",
        icon: Users,
      },
      {
        title: "Showing",
        value: filteredLeads.length,
        desc: "After filters",
        icon: SlidersHorizontal,
      },
      {
        title: "Hot Leads",
        value: hotLeads.length,
        desc: "High priority",
        icon: Flame,
      },
      {
        title: "Won Leads",
        value: wonLeads.length,
        desc: "Converted leads",
        icon: CheckCircle2,
      },
    ];
  }, [leads, filteredLeads]);

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:rounded-4xl sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  Lead Management
                </p>

                <h1 className="mt-2 text-2xl font-black sm:text-3xl lg:text-4xl">
                  Leads
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                  Manage website enquiries, Meta Ads leads, WhatsApp leads,
                  referrals and manual business leads.
                </p>
              </div>

              <Link
                href="/leads/new"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
              >
                <Plus size={18} />
                Add Lead
              </Link>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </section>

          <section className="theme-card p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <div className="relative col-span-2 lg:col-span-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, company..."
                  className="theme-input pl-11"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="theme-input text-sm"
              >
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="theme-input text-sm"
              >
                {sources.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="theme-input col-span-2 text-sm lg:col-span-1"
              >
                {priorities.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted sm:text-sm">
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
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Lead Cards
                  </h2>
                  <p className="text-xs font-semibold text-muted sm:text-sm">
                    Mobile friendly card view
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredLeads.map((lead) => (
                  <LeadCard key={lead._id || lead.id} lead={lead} />
                ))}
              </div>
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
