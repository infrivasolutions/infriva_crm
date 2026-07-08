"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  FileText,
  IndianRupee,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const sourceOptions = [
  "Website",
  "Meta Ads",
  "Manual",
  "WhatsApp",
  "Referral",
  "Other",
];

const statusOptions = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Won",
  "Lost",
];

const priorityOptions = ["Hot", "Warm", "Cold"];

function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{desc}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Icon size={22} />
        </div>
      </div>

      {children}
    </section>
  );
}

function Field({ label, required, icon: Icon, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
        {Icon && <Icon size={15} className="text-primary" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

export default function NewLeadPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    email: "",
    company: "",
    service: "",
    budget: "",
    message: "",
    source: "Manual",
    status: "New",
    priority: "Warm",
    followUpDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.clientName.trim()) {
        throw new Error("Client name is required");
      }

      if (!form.phone.trim()) {
        throw new Error("Phone number is required");
      }

      if (!form.service.trim()) {
        throw new Error("Service is required");
      }

      const payload = {
        ...form,
        clientName: form.clientName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        service: form.service.trim(),
        budget: form.budget.trim(),
        message: form.message.trim(),
        followUpDate: form.followUpDate || undefined,
      };

      const res = await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const leadId = res?.lead?._id || res?.data?._id;

      if (leadId) {
        router.push(`/leads/${leadId}`);
      } else {
        router.push("/leads");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                New Lead
              </p>

              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                Add CRM Lead
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Add manual leads from calls, WhatsApp, referrals, website
                enquiry or Meta Ads.
              </p>
            </div>

            <Link
              href="/leads"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:w-fit sm:rounded-full"
            >
              <ArrowLeft size={18} />
              Back to Leads
            </Link>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <FormSection
            title="Client Details"
            desc="Basic contact information of the lead."
            icon={User}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Client Name" required icon={User}>
                <input
                  value={form.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  className="theme-input"
                  placeholder="Enter client name"
                />
              </Field>

              <Field label="Phone" required icon={Phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="theme-input"
                  placeholder="Enter phone number"
                />
              </Field>

              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="theme-input"
                  placeholder="Enter email address"
                />
              </Field>

              <Field label="Company" icon={Building2}>
                <input
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  className="theme-input"
                  placeholder="Enter company name"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Lead Requirement"
            desc="Service, budget and source information."
            icon={Sparkles}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Service" required icon={Sparkles}>
                <input
                  value={form.service}
                  onChange={(e) => updateField("service", e.target.value)}
                  className="theme-input"
                  placeholder="Website, CRM, SEO, WhatsApp API..."
                />
              </Field>

              <Field label="Budget" icon={IndianRupee}>
                <input
                  value={form.budget}
                  onChange={(e) => updateField("budget", e.target.value)}
                  className="theme-input"
                  placeholder="₹25,000 - ₹50,000"
                />
              </Field>

              <Field label="Source" icon={Send}>
                <select
                  value={form.source}
                  onChange={(e) => updateField("source", e.target.value)}
                  className="theme-input"
                >
                  {sourceOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Follow-up Date" icon={CalendarClock}>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => updateField("followUpDate", e.target.value)}
                  className="theme-input"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Lead Status"
            desc="Set current stage and priority for follow-up."
            icon={FileText}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Status" icon={FileText}>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="theme-input"
                >
                  {statusOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>

              <Field label="Priority" icon={Sparkles}>
                <select
                  value={form.priority}
                  onChange={(e) => updateField("priority", e.target.value)}
                  className="theme-input"
                >
                  {priorityOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </Field>
            </div>
          </FormSection>

          <FormSection
            title="Requirement Notes"
            desc="Add extra details shared by the client."
            icon={MessageSquare}
          >
            <Field label="Message" icon={MessageSquare}>
              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="theme-input min-h-36 resize-none"
                placeholder="Client requirement, notes, business details..."
              />
            </Field>
          </FormSection>

          <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:static sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link href="/leads" className="theme-btn-outline w-full sm:w-fit">
                Cancel
              </Link>

              <button
                disabled={loading}
                className="theme-btn w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Lead
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
