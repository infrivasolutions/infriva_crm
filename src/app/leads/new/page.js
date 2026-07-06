"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, Loader2, Save } from "lucide-react";
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
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              New Lead
            </p>
            <h1 className="mt-2 text-3xl font-black">Add CRM Lead</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Add manual leads from calls, WhatsApp, referrals, website enquiry
              or Meta Ads.
            </p>
          </div>

          <Link
            href="/leads"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back to Leads
          </Link>
        </section>

        <form onSubmit={handleSubmit} className="theme-card p-5 sm:p-6">
          {error && (
            <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-black">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.clientName}
                onChange={(e) => updateField("clientName", e.target.value)}
                className="theme-input"
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="theme-input"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Email</label>
              <input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="theme-input"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Company</label>
              <input
                value={form.company}
                onChange={(e) => updateField("company", e.target.value)}
                className="theme-input"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Service <span className="text-red-500">*</span>
              </label>
              <input
                value={form.service}
                onChange={(e) => updateField("service", e.target.value)}
                className="theme-input"
                placeholder="Website, CRM, SEO, WhatsApp API..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Budget</label>
              <input
                value={form.budget}
                onChange={(e) => updateField("budget", e.target.value)}
                className="theme-input"
                placeholder="₹25,000 - ₹50,000"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Source</label>
              <select
                value={form.source}
                onChange={(e) => updateField("source", e.target.value)}
                className="theme-input"
              >
                {sourceOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Status</label>
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
              <label className="mb-2 block text-sm font-black">Priority</label>
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
                onChange={(e) => updateField("followUpDate", e.target.value)}
                className="theme-input"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className="theme-input min-h-32 resize-none"
                placeholder="Client requirement, notes, business details..."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/leads" className="theme-btn-outline">
              Cancel
            </Link>

            <button
              disabled={loading}
              className="theme-btn disabled:opacity-60"
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
        </form>
      </div>
    </DashboardLayout>
  );
}
