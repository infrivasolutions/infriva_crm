"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  IndianRupee,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = ["Draft", "Sent", "Accepted", "Rejected"];

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) =>
  client?.companyName || client?.company || "No company added";

const getStatusClass = (status = "") => {
  if (status === "Accepted") return "bg-green-50 text-green-700";
  if (status === "Rejected") return "bg-red-50 text-red-700";
  if (status === "Sent") return "bg-blue-50 text-blue-700";
  return "bg-primary-light text-primary";
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

const toDateInputValue = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const formatAmount = (amount) => {
  const value = Number(amount || 0);

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-3xl border border-border bg-surface-alt p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-purple-100 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white">
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

function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="theme-card p-4 sm:p-6">
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

function AmountSummary({ totals, saving, onSave, onRefresh }) {
  return (
    <div className="theme-card p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-black sm:text-xl">Amount Summary</h2>

        <p className="mt-1 text-xs text-muted sm:text-sm">
          Auto calculated quotation total
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
          <span className="text-sm font-bold text-muted">Sub Total</span>
          <span className="font-black text-foreground">
            {formatAmount(totals.subTotal)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
          <span className="text-sm font-bold text-muted">Discount</span>
          <span className="font-black text-foreground">
            - {formatAmount(totals.discount)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
          <span className="text-sm font-bold text-muted">Tax</span>
          <span className="font-black text-foreground">
            + {formatAmount(totals.tax)}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-primary px-4 py-5 text-white">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            <span className="text-sm font-black">Total</span>
            <span className="text-xl font-black sm:text-2xl">
              {formatAmount(totals.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="theme-btn mt-5 hidden w-full disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
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

      <button
        type="button"
        onClick={onRefresh}
        className="theme-btn-outline mt-3 hidden w-full sm:flex"
      >
        <RefreshCcw size={18} />
        Refresh
      </button>
    </div>
  );
}

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params?.id;

  const [quotation, setQuotation] = useState(null);

  const [form, setForm] = useState({
    title: "",
    status: "Draft",
    discount: "",
    tax: "",
    validTill: "",
    notes: "",
    items: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await apiFetch(`/quotations/${quotationId}`);
      const quotationData = res?.quotation || res?.data;

      if (!quotationData) {
        throw new Error("Quotation not found");
      }

      setQuotation(quotationData);

      setForm({
        title: quotationData?.title || "",
        status: quotationData?.status || "Draft",
        discount: quotationData?.discount || "",
        tax: quotationData?.tax || "",
        validTill: toDateInputValue(quotationData?.validTill),
        notes: quotationData?.notes || "",
        items:
          quotationData?.items?.length > 0
            ? quotationData.items.map((item) => ({
                title: item.title || "",
                description: item.description || "",
                price: item.price || "",
              }))
            : [
                {
                  title: "",
                  description: "",
                  price: "",
                },
              ],
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

      setError(err?.message || "Failed to load quotation");
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

    if (quotationId) {
      fetchQuotation();
    }
  }, [quotationId, router]);

  const totals = useMemo(() => {
    const subTotal = form.items.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0,
    );

    const discount = Number(form.discount || 0);
    const tax = Number(form.tax || 0);
    const totalAmount = Math.max(subTotal - discount + tax, 0);

    return {
      subTotal,
      discount,
      tax,
      totalAmount,
    };
  }, [form.items, form.discount, form.tax]);

  const whatsappLink = useMemo(() => {
    const phone = String(quotation?.client?.phone || "").replace(/\D/g, "");

    if (!phone) return "#";

    const message = encodeURIComponent(
      `Hello ${getClientName(
        quotation?.client,
      )}, this is Infriva Solutions. Sharing an update regarding your quotation: ${
        quotation?.quotationNo || quotation?.title || ""
      }.`,
    );

    return `https://wa.me/91${phone.slice(-10)}?text=${message}`;
  }, [quotation]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateItem = (index, name, value) => {
    setForm((prev) => {
      const items = [...prev.items];

      items[index] = {
        ...items[index],
        [name]: value,
      };

      return {
        ...prev,
        items,
      };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          title: "",
          description: "",
          price: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length === 1) return prev;

      return {
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        throw new Error("Quotation title is required");
      }

      const cleanItems = form.items
        .filter((item) => item.title.trim())
        .map((item) => ({
          title: item.title.trim(),
          description: item.description.trim(),
          price: Number(item.price || 0),
        }));

      if (cleanItems.length === 0) {
        throw new Error("At least one quotation item is required");
      }

      const payload = {
        title: form.title.trim(),
        items: cleanItems,
        discount: Number(form.discount || 0),
        tax: Number(form.tax || 0),
        status: form.status,
        notes: form.notes.trim(),
        validTill: form.validTill || null,
      };

      const res = await apiFetch(`/quotations/${quotationId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedQuotation = res?.quotation || res?.data;

      if (updatedQuotation) {
        setQuotation(updatedQuotation);
      } else {
        await fetchQuotation();
      }

      setSuccess("Quotation updated successfully");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to update quotation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <RoleGuard allowedRoles={["admin", "ads-manager"]}>
        <DashboardLayout>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
              <Loader2 className="animate-spin text-primary" size={36} />

              <h2 className="mt-4 text-xl font-black">Loading Quotation</h2>

              <p className="mt-2 text-sm text-muted">
                Fetching quotation details...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (error && !quotation) {
    return (
      <RoleGuard allowedRoles={["admin", "ads-manager"]}>
        <DashboardLayout>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="theme-card w-full max-w-md p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">Quotation Error</h2>

              <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

              <div className="mt-5 flex justify-center gap-3">
                <Link href="/quotations" className="theme-btn-outline">
                  Back
                </Link>

                <button
                  type="button"
                  onClick={fetchQuotation}
                  className="theme-btn"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div className="min-w-0">
                <Link
                  href="/quotations"
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
                >
                  <ArrowLeft size={17} />
                  Back to Quotations
                </Link>

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  Quotation Detail
                </p>

                <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                  {quotation?.quotationNo || "Quotation"}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  {quotation?.title} for {getClientName(quotation?.client)}.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getStatusClass(
                      quotation?.status,
                    )}`}
                  >
                    {quotation?.status || "Draft"}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    Total {formatAmount(quotation?.totalAmount)}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    Created {formatDate(quotation?.createdAt)}
                  </span>

                  {quotation?.validTill && (
                    <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                      Valid Till {formatDate(quotation.validTill)}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:justify-end">
                {quotation?.client?.phone && (
                  <HeroAction
                    href={`tel:${quotation.client.phone}`}
                    icon={Phone}
                  >
                    Call
                  </HeroAction>
                )}

                {quotation?.client?.phone && (
                  <HeroAction
                    href={whatsappLink}
                    icon={MessageCircle}
                    variant="glass"
                  >
                    WhatsApp
                  </HeroAction>
                )}

                {quotation?.client?.email && (
                  <HeroAction
                    href={`mailto:${quotation.client.email}`}
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
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
              {success}
            </div>
          )}

          <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr] xl:gap-6">
            <div className="space-y-5 sm:space-y-6">
              <FormSection
                title="Quotation Information"
                desc="Edit title, status, items, notes and validity."
                icon={FileText}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-black">
                      Quotation Title
                    </label>

                    <input
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="theme-input"
                      placeholder="Quotation title"
                    />
                  </div>

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
                      Valid Till
                    </label>

                    <input
                      type="date"
                      value={form.validTill}
                      onChange={(e) => updateField("validTill", e.target.value)}
                      className="theme-input"
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Quotation Items"
                desc="Manage service-wise pricing."
                icon={IndianRupee}
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-black text-foreground">
                      Pricing Items
                    </h3>

                    <p className="mt-1 text-xs text-muted sm:text-sm">
                      Add one or more services with price.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="theme-btn-outline w-full sm:w-fit"
                  >
                    <Plus size={17} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-4">
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-border bg-surface-alt p-4 sm:rounded-3xl"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-primary">
                          Item #{index + 1}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
                        <div>
                          <label className="mb-2 block text-sm font-black">
                            Item Title
                          </label>

                          <input
                            value={item.title}
                            onChange={(e) =>
                              updateItem(index, "title", e.target.value)
                            }
                            className="theme-input bg-white"
                            placeholder="Website Design"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-black">
                            Price
                          </label>

                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(index, "price", e.target.value)
                            }
                            className="theme-input bg-white"
                            placeholder="25000"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-2 block text-sm font-black">
                            Description
                          </label>

                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            className="theme-input min-h-24 resize-none bg-white"
                            placeholder="Service item details..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </FormSection>

              <FormSection
                title="Terms & Notes"
                desc="Update discount, tax and proposal notes."
                icon={CalendarClock}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Discount
                    </label>

                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => updateField("discount", e.target.value)}
                      className="theme-input"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black">Tax</label>

                    <input
                      type="number"
                      value={form.tax}
                      onChange={(e) => updateField("tax", e.target.value)}
                      className="theme-input"
                      placeholder="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-black">
                      Notes
                    </label>

                    <textarea
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      className="theme-input min-h-28 resize-none"
                      placeholder="Payment terms, timeline, project notes..."
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="Client Information"
                desc="Quotation connected client."
                icon={User}
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                  <DetailItem
                    icon={User}
                    label="Client"
                    value={getClientName(quotation?.client)}
                  />

                  <DetailItem
                    icon={Phone}
                    label="Phone"
                    value={quotation?.client?.phone}
                  />

                  <DetailItem
                    icon={Mail}
                    label="Email"
                    value={quotation?.client?.email}
                  />

                  <DetailItem
                    icon={FileText}
                    label="Quotation No"
                    value={quotation?.quotationNo}
                  />
                </div>

                {quotation?.client?._id && (
                  <div className="mt-5">
                    <Link
                      href={`/clients/${quotation.client._id}`}
                      className="theme-btn-outline w-full sm:w-fit"
                    >
                      View Client
                    </Link>
                  </div>
                )}
              </FormSection>
            </div>

            <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
              <AmountSummary
                totals={totals}
                saving={saving}
                onSave={handleSave}
                onRefresh={fetchQuotation}
              />

              <div className="theme-card p-4 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-black sm:text-xl">
                    Quick Actions
                  </h2>

                  <p className="mt-1 text-xs text-muted sm:text-sm">
                    Move quotation to next step.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => updateField("status", "Sent")}
                    className="theme-btn-outline w-full"
                  >
                    Mark Sent
                  </button>

                  <button
                    type="button"
                    onClick={() => updateField("status", "Accepted")}
                    className="theme-btn w-full"
                  >
                    <CheckCircle2 size={18} />
                    Mark Accepted
                  </button>

                  {quotation?.client?._id && (
                    <Link
                      href={`/projects/new?client=${quotation.client._id}`}
                      className="theme-btn-outline w-full"
                    >
                      Create Project
                    </Link>
                  )}
                </div>
              </div>

              <div className="rounded-4xl border border-border bg-primary-light p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary">
                  <IndianRupee size={22} />
                </div>

                <p className="mt-4 text-sm font-black text-primary">
                  Quotation Reminder
                </p>

                <p className="mt-2 text-sm leading-7 text-muted">
                  After client accepts the quotation, create a project and
                  connect delivery work from the project section.
                </p>
              </div>
            </aside>
          </section>

          <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-primary-light px-4 py-3">
              <span className="text-xs font-black text-primary">Total</span>
              <span className="text-sm font-black text-primary">
                {formatAmount(totals.totalAmount)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="theme-btn w-full rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
