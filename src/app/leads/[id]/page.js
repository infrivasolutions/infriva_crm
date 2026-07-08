"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

const priorityOptions = ["Hot", "Warm", "Cold"];

const getLeadName = (lead) =>
  lead?.clientName || lead?.name || lead?.fullName || "Unnamed Lead";

const getLeadCompany = (lead) =>
  lead?.company || lead?.companyName || lead?.businessName || "";

const getLeadService = (lead) =>
  lead?.service ||
  lead?.serviceInterested ||
  lead?.serviceRequired ||
  lead?.requirement ||
  "No service added";

const getLeadSource = (lead) =>
  lead?.source || lead?.leadSource || lead?.lead_source || "Unknown source";

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

const formatDateTime = (date) => {
  if (!date) return "—";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateInputValue = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
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

function ActionButton({
  href,
  onClick,
  icon: Icon,
  children,
  variant = "white",
}) {
  const classes =
    variant === "white"
      ? "bg-white text-primary hover:bg-primary-light"
      : "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20";

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition sm:rounded-full sm:px-5 sm:text-sm ${classes}`}
      >
        <Icon size={17} />
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition sm:rounded-full sm:px-5 sm:text-sm ${classes}`}
    >
      <Icon size={17} />
      {children}
    </button>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id;

  const [lead, setLead] = useState(null);

  const [form, setForm] = useState({
    status: "New",
    priority: "Warm",
    followUpDate: "",
  });

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteSaving, setNoteSaving] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchLead = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await apiFetch(`/leads/${leadId}`);
      const leadData = res?.lead || res?.data;

      if (!leadData) {
        throw new Error("Lead not found");
      }

      setLead(leadData);

      setForm({
        status: leadData?.status || "New",
        priority: leadData?.priority || "Warm",
        followUpDate: toDateInputValue(leadData?.followUpDate),
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

      setError(err?.message || "Failed to load lead");
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

    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        status: form.status,
        priority: form.priority,
        followUpDate: form.followUpDate || null,
      };

      const res = await apiFetch(`/leads/${leadId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedLead = res?.lead || res?.data;

      if (updatedLead) {
        setLead(updatedLead);
      } else {
        await fetchLead();
      }

      setSuccess("Lead updated successfully");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();

    try {
      setNoteSaving(true);
      setError("");
      setSuccess("");

      if (!note.trim()) {
        throw new Error("Note is required");
      }

      const res = await apiFetch(`/leads/${leadId}/note`, {
        method: "POST",
        body: JSON.stringify({ text: note.trim() }),
      });

      const updatedLead = res?.lead || res?.data;

      if (updatedLead) {
        setLead(updatedLead);
      } else {
        await fetchLead();
      }

      setNote("");
      setSuccess("Note added successfully");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to add note");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleConvertToClient = async () => {
    try {
      const confirmConvert = window.confirm(
        "Are you sure you want to convert this lead to client?",
      );

      if (!confirmConvert) return;

      setConverting(true);
      setError("");
      setSuccess("");

      const res = await apiFetch(`/leads/${leadId}/convert`, {
        method: "POST",
      });

      const clientId = res?.client?._id || res?.data?._id;

      if (clientId) {
        router.push(`/clients/${clientId}`);
      } else {
        setSuccess("Lead converted to client successfully");
        await fetchLead();
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to convert lead to client");
    } finally {
      setConverting(false);
    }
  };

  const whatsappLink = useMemo(() => {
    const phone = String(lead?.phone || "").replace(/\D/g, "");

    if (!phone) return "#";

    const message = encodeURIComponent(
      `Hello ${getLeadName(
        lead,
      )}, this is Infriva Solutions. We received your enquiry for ${getLeadService(
        lead,
      )}.`,
    );

    return `https://wa.me/91${phone.slice(-10)}?text=${message}`;
  }, [lead]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />

            <h2 className="mt-4 text-xl font-black">Loading Lead</h2>

            <p className="mt-2 text-sm text-muted">
              Fetching complete lead details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !lead) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-xl font-black">Lead Error</h2>

            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

            <div className="mt-5 flex justify-center gap-3">
              <Link href="/leads" className="theme-btn-outline">
                Back
              </Link>

              <button onClick={fetchLead} className="theme-btn">
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
                href="/leads"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
              >
                <ArrowLeft size={17} />
                Back to Leads
              </Link>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                Lead Detail
              </p>

              <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                {getLeadName(lead)}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                {getLeadService(lead)} enquiry from {getLeadSource(lead)}.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getStatusClass(
                    lead?.status,
                  )}`}
                >
                  {lead?.status || "New"}
                </span>

                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getPriorityClass(
                    lead?.priority,
                  )}`}
                >
                  {lead?.priority || "Warm"} Priority
                </span>

                <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                  Created {formatDate(lead?.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:justify-end">
              {lead?.phone && (
                <ActionButton href={`tel:${lead.phone}`} icon={Phone}>
                  Call
                </ActionButton>
              )}

              {lead?.phone && (
                <ActionButton
                  href={whatsappLink}
                  icon={MessageCircle}
                  variant="glass"
                >
                  WhatsApp
                </ActionButton>
              )}

              {lead?.email && (
                <ActionButton
                  href={`mailto:${lead.email}`}
                  icon={Mail}
                  variant="glass"
                >
                  Email
                </ActionButton>
              )}
            </div>
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

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
          <div className="space-y-5 sm:space-y-6">
            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black sm:text-xl">
                    Lead Information
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Client contact and enquiry details
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
                  value={getLeadName(lead)}
                />

                <DetailItem icon={Phone} label="Phone" value={lead?.phone} />

                <DetailItem icon={Mail} label="Email" value={lead?.email} />

                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={getLeadCompany(lead)}
                />

                <DetailItem
                  icon={Sparkles}
                  label="Service"
                  value={getLeadService(lead)}
                />

                <DetailItem
                  icon={FileText}
                  label="Budget"
                  value={lead?.budget}
                />

                <DetailItem
                  icon={Send}
                  label="Source"
                  value={getLeadSource(lead)}
                />

                <DetailItem
                  icon={CalendarClock}
                  label="Follow-up"
                  value={formatDate(lead?.followUpDate)}
                />
              </div>

              {lead?.message && (
                <div className="mt-4 rounded-3xl border border-border bg-surface-alt p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-muted">
                    Message
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {lead.message}
                  </p>
                </div>
              )}
            </div>

            {(getLeadSource(lead) === "Meta Ads" ||
              lead?.metaLeadId ||
              lead?.campaignName ||
              lead?.adName ||
              lead?.formName) && (
              <div className="theme-card p-4 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-black sm:text-xl">
                    Meta Ads Details
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Campaign and form tracking details
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                  <DetailItem
                    icon={FileText}
                    label="Meta Lead ID"
                    value={lead?.metaLeadId}
                  />

                  <DetailItem
                    icon={Sparkles}
                    label="Campaign"
                    value={lead?.campaignName}
                  />

                  <DetailItem
                    icon={Send}
                    label="Ad Name"
                    value={lead?.adName}
                  />

                  <DetailItem
                    icon={FileText}
                    label="Form Name"
                    value={lead?.formName}
                  />
                </div>
              </div>
            )}

            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black sm:text-xl">
                    Notes Timeline
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Follow-up notes and client updates
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Clock size={22} />
                </div>
              </div>

              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="theme-input min-h-28 resize-none"
                  placeholder="Add call update, client requirement, next step..."
                />

                <div className="mt-3 flex justify-end">
                  <button
                    disabled={noteSaving}
                    className="theme-btn w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
                  >
                    {noteSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Add Note
                      </>
                    )}
                  </button>
                </div>
              </form>

              {(lead?.notes || []).length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-surface-alt p-6 text-center sm:p-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <FileText size={24} />
                  </div>

                  <h3 className="mt-4 text-lg font-black">No notes yet</h3>

                  <p className="mt-2 text-sm text-muted">
                    Add the first note after calling or contacting the client.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...(lead?.notes || [])].reverse().map((item, index) => (
                    <div
                      key={item?._id || index}
                      className="rounded-3xl border border-border bg-surface-alt p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap text-sm font-semibold leading-7 text-foreground">
                            {item?.text}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-muted">
                            <span>
                              Added by{" "}
                              {item?.addedBy?.name ||
                                item?.addedBy?.email ||
                                "Team Member"}
                            </span>

                            <span>•</span>

                            <span>{formatDateTime(item?.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black sm:text-xl">Update Lead</h2>

                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Change status, priority and follow-up date
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="theme-input"
                  >
                    {statusOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(e) => updateField("priority", e.target.value)}
                    className="theme-input"
                  >
                    {priorityOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(e) =>
                      updateField("followUpDate", e.target.value)
                    }
                    className="theme-input"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="theme-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black sm:text-xl">Quick Actions</h2>

                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Move this lead to next business stage
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleConvertToClient}
                  disabled={converting}
                  className="theme-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {converting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Convert To Client
                    </>
                  )}
                </button>

                <button
                  onClick={fetchLead}
                  className="theme-btn-outline w-full"
                >
                  <RefreshCcw size={18} />
                  Refresh Lead
                </button>
              </div>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">Lead Reminder</p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Always add notes after every call or WhatsApp conversation. This
                keeps the full sales history clean and trackable.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
