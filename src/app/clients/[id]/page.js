"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  FileText,
  FolderKanban,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCcw,
  Sparkles,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) =>
  client?.companyName ||
  client?.company ||
  client?.businessName ||
  "No company added";

const getLeadService = (lead) =>
  lead?.service ||
  lead?.serviceInterested ||
  lead?.serviceRequired ||
  lead?.requirement ||
  "Not specified";

const getLeadBudget = (lead) => lead?.budget || "—";

const getLeadSource = (lead) =>
  lead?.source || lead?.leadSource || lead?.lead_source || "Unknown";

const getAssignedName = (client) =>
  client?.assignedTo?.name || client?.assignedTo?.email || "Not assigned";

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

function HeroAction({ href, icon: Icon, children, variant = "white" }) {
  const classes =
    variant === "white"
      ? "bg-white text-primary hover:bg-primary-light"
      : "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20";

  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition sm:rounded-full sm:px-5 sm:text-sm ${classes}`}
    >
      <Icon size={17} />
      {children}
    </a>
  );
}

function WorkCard({ icon: Icon, title, desc, href, action }) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-border bg-surface-alt p-4 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-purple-100 sm:p-5"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
        <Icon size={22} />
      </div>

      <h3 className="mt-4 text-base font-black text-foreground sm:text-lg">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
        {desc}
      </p>

      <div className="mt-4 inline-flex items-center gap-1 text-xs font-black text-primary sm:text-sm">
        {action}
        <ArrowRight
          size={15}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id;

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchClient = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`/clients/${clientId}`);
      const clientData = res?.client || res?.data;

      if (!clientData) {
        throw new Error("Client not found");
      }

      setClient(clientData);
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

      setError(err?.message || "Failed to load client");
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

    if (clientId) {
      fetchClient();
    }
  }, [clientId]);

  const whatsappLink = useMemo(() => {
    const phone = String(client?.phone || "").replace(/\D/g, "");

    if (!phone) return "#";

    const message = encodeURIComponent(
      `Hello ${getClientName(client)}, this is Infriva Solutions.`,
    );

    return `https://wa.me/91${phone.slice(-10)}?text=${message}`;
  }, [client]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />

            <h2 className="mt-4 text-xl font-black">Loading Client</h2>

            <p className="mt-2 text-sm text-muted">
              Fetching complete client details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !client) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-xl font-black">Client Error</h2>

            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

            <div className="mt-5 flex justify-center gap-3">
              <Link href="/clients" className="theme-btn-outline">
                Back
              </Link>

              <button onClick={fetchClient} className="theme-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="min-w-0">
              <Link
                href="/clients"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
              >
                <ArrowLeft size={17} />
                Back to Clients
              </Link>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                Client Detail
              </p>

              <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                {getClientName(client)}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                {getCompanyName(client)}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-2 text-[11px] font-black text-primary sm:px-4 sm:text-xs">
                  Active Client
                </span>

                {client?.lead && (
                  <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    Converted From Lead
                  </span>
                )}

                <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                  Added {formatDate(client?.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:justify-end">
              {client?.phone && (
                <HeroAction href={`tel:${client.phone}`} icon={Phone}>
                  Call
                </HeroAction>
              )}

              {client?.phone && (
                <HeroAction
                  href={whatsappLink}
                  icon={MessageCircle}
                  variant="glass"
                >
                  WhatsApp
                </HeroAction>
              )}

              {client?.email && (
                <HeroAction
                  href={`mailto:${client.email}`}
                  icon={Mail}
                  variant="glass"
                >
                  Email
                </HeroAction>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
          <div className="space-y-5 sm:space-y-6">
            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black sm:text-xl">
                    Client Information
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Contact and company details
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <User size={22} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                <DetailItem
                  icon={User}
                  label="Client Name"
                  value={getClientName(client)}
                />

                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={getCompanyName(client)}
                />

                <DetailItem icon={Phone} label="Phone" value={client?.phone} />

                <DetailItem icon={Mail} label="Email" value={client?.email} />

                <DetailItem
                  icon={UserCog}
                  label="Assigned To"
                  value={getAssignedName(client)}
                />

                <DetailItem
                  icon={CalendarClock}
                  label="Created At"
                  value={formatDate(client?.createdAt)}
                />
              </div>
            </div>

            {client?.lead && (
              <div className="theme-card p-4 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-black sm:text-xl">
                    Original Lead
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Source lead information before conversion
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                  <DetailItem
                    icon={Sparkles}
                    label="Lead Service"
                    value={getLeadService(client?.lead)}
                  />

                  <DetailItem
                    icon={FileText}
                    label="Lead Budget"
                    value={getLeadBudget(client?.lead)}
                  />

                  <DetailItem
                    icon={MessageCircle}
                    label="Lead Source"
                    value={getLeadSource(client?.lead)}
                  />

                  <DetailItem
                    icon={CalendarClock}
                    label="Lead Created"
                    value={formatDate(client?.lead?.createdAt)}
                  />
                </div>

                {client?.lead?._id && (
                  <div className="mt-5">
                    <Link
                      href={`/leads/${client.lead._id}`}
                      className="theme-btn-outline w-full sm:w-fit"
                    >
                      View Original Lead
                    </Link>
                  </div>
                )}
              </div>
            )}

            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black sm:text-xl">
                  Client Work Overview
                </h2>

                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Projects and quotations will be connected here.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <WorkCard
                  icon={FolderKanban}
                  title="Projects"
                  desc="Create and manage client projects from this CRM."
                  href={`/projects/new?client=${client?._id}`}
                  action="Create Project"
                />

                <WorkCard
                  icon={FileText}
                  title="Quotations"
                  desc="Prepare quotations and proposals for this client."
                  href={`/quotations/new?client=${client?._id}`}
                  action="Create Quotation"
                />
              </div>
            </div>
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black sm:text-xl">Quick Actions</h2>

                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Start client work quickly
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/projects/new?client=${client?._id}`}
                  className="theme-btn w-full"
                >
                  <FolderKanban size={18} />
                  New Project
                </Link>

                <Link
                  href={`/quotations/new?client=${client?._id}`}
                  className="theme-btn-outline w-full"
                >
                  <FileText size={18} />
                  New Quotation
                </Link>

                <button
                  onClick={fetchClient}
                  className="theme-btn-outline w-full"
                >
                  <RefreshCcw size={18} />
                  Refresh Client
                </button>
              </div>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">Client Reminder</p>

              <p className="mt-2 text-sm leading-7 text-muted">
                After converting a lead to client, create a project or quotation
                immediately so delivery and sales tracking stay connected.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
