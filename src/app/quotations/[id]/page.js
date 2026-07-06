"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
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

  return new Date(date).toLocaleDateString("en-IN", {
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
    <div className="rounded-2xl border border-border bg-surface-alt p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            {label}
          </p>

          <p className="mt-1 wrap-break-word text-sm font-bold text-foreground">
            {value || "—"}
          </p>
        </div>
      </div>
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
    const totalAmount = subTotal - discount + tax;

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
          description: item.description,
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
        notes: form.notes,
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
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />
            <h2 className="mt-4 text-xl font-black">Loading Quotation</h2>
            <p className="mt-2 text-sm text-muted">
              Fetching quotation details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !quotation) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-xl font-black">Quotation Error</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

            <div className="mt-5 flex justify-center gap-3">
              <Link href="/quotations" className="theme-btn-outline">
                Back
              </Link>

              <button onClick={fetchQuotation} className="theme-btn">
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
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <Link
                href="/quotations"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft size={17} />
                Back to Quotations
              </Link>

              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Quotation Detail
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {quotation?.quotationNo || "Quotation"}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                {quotation?.title} for {getClientName(quotation?.client)}.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${getStatusClass(
                    quotation?.status,
                  )}`}
                >
                  {quotation?.status || "Draft"}
                </span>

                <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                  Total {formatAmount(quotation?.totalAmount)}
                </span>

                <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                  Created {formatDate(quotation?.createdAt)}
                </span>

                {quotation?.validTill && (
                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                    Valid Till {formatDate(quotation.validTill)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {quotation?.client?.phone && (
                <a
                  href={`tel:${quotation.client.phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
                >
                  <Phone size={18} />
                  Call Client
                </a>
              )}

              {quotation?.client?.phone && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              )}

              {quotation?.client?.email && (
                <a
                  href={`mailto:${quotation.client.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Mail size={18} />
                  Email
                </a>
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

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-black">Quotation Information</h2>
                <p className="mt-1 text-sm text-muted">
                  Edit title, status, items, notes and validity.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
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
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Quotation Items</h2>
                  <p className="mt-1 text-sm text-muted">
                    Manage service-wise pricing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="theme-btn-outline"
                >
                  <Plus size={17} />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {form.items.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-3xl border border-border bg-surface-alt p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_0.4fr_auto]">
                      <div>
                        <label className="mb-2 block text-sm font-black">
                          Item Title
                        </label>

                        <input
                          value={item.title}
                          onChange={(e) =>
                            updateItem(index, "title", e.target.value)
                          }
                          className="theme-input"
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
                          className="theme-input"
                          placeholder="25000"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="md:col-span-3">
                        <label className="mb-2 block text-sm font-black">
                          Description
                        </label>

                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          className="theme-input min-h-24 resize-none"
                          placeholder="Service item details..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="grid gap-5 md:grid-cols-2">
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

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black">Notes</label>

                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="theme-input min-h-28 resize-none"
                    placeholder="Payment terms, timeline, project notes..."
                  />
                </div>
              </div>
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Client Information</h2>
                <p className="mt-1 text-sm text-muted">
                  Quotation connected client
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                    className="theme-btn-outline"
                  >
                    View Client
                  </Link>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Amount Summary</h2>
                <p className="mt-1 text-sm text-muted">
                  Auto calculated quotation total
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
                  <span className="text-sm font-bold text-muted">
                    Sub Total
                  </span>
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

                <div className="flex items-center justify-between rounded-3xl bg-primary px-4 py-4 text-white">
                  <span className="text-sm font-black">Total</span>
                  <span className="text-xl font-black">
                    {formatAmount(totals.totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="theme-btn mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
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
                onClick={fetchQuotation}
                className="theme-btn-outline mt-3 w-full"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Quick Actions</h2>
                <p className="mt-1 text-sm text-muted">
                  Move quotation to next step
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => updateField("status", "Sent")}
                  className="theme-btn-outline w-full"
                >
                  Mark Sent
                </button>

                <button
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
                After client accepts the quotation, create a project and connect
                delivery work from the project section.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
