"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  FileText,
  IndianRupee,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = ["Draft", "Sent", "Accepted", "Rejected"];

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) => client?.companyName || client?.company || "";

const formatAmount = (amount) => {
  const value = Number(amount || 0);

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

export default function NewQuotationPage() {
  const router = useRouter();

  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    client: "",
    title: "",
    status: "Draft",
    discount: "",
    tax: "",
    validTill: "",
    notes: "",
    items: [
      {
        title: "",
        description: "",
        price: "",
      },
    ],
  });

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const params = new URLSearchParams(window.location.search);
      const selectedClient = params.get("client") || "";

      const clientsRes = await apiFetch("/clients");
      const clientsData = clientsRes?.clients || clientsRes?.data || [];

      setClients(clientsData);

      setForm((prev) => ({
        ...prev,
        client: selectedClient,
      }));
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

      setError(err?.message || "Failed to load quotation form");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    fetchInitialData();
  }, [router]);

  const selectedClient = useMemo(() => {
    return clients.find((client) => client._id === form.client);
  }, [clients, form.client]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.client) {
        throw new Error("Please select a client");
      }

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
        client: form.client,
        lead: selectedClient?.lead?._id || selectedClient?.lead || null,
        title: form.title.trim(),
        items: cleanItems,
        discount: Number(form.discount || 0),
        tax: Number(form.tax || 0),
        status: form.status,
        notes: form.notes,
        validTill: form.validTill || null,
      };

      const res = await apiFetch("/quotations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const quotationId = res?.quotation?._id || res?.data?._id;

      if (quotationId) {
        router.push(`/quotations/${quotationId}`);
      } else {
        router.push("/quotations");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create quotation");
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />
            <h2 className="mt-4 text-xl font-black">Loading Quotation Form</h2>
            <p className="mt-2 text-sm text-muted">
              Fetching client details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              New Quotation
            </p>

            <h1 className="mt-2 text-3xl font-black">Create Quotation</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Prepare pricing proposal for website, CRM, SEO, automation or
              custom IT services.
            </p>
          </div>

          <Link
            href="/quotations"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back to Quotations
          </Link>
        </section>

        {selectedClient && (
          <section className="theme-card-soft p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <User size={22} />
              </div>

              <div>
                <p className="text-sm font-black text-primary">
                  Selected Client
                </p>

                <h2 className="mt-1 text-xl font-black text-foreground">
                  {getClientName(selectedClient)}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {getCompanyName(selectedClient) || "No company added"}
                </p>
              </div>
            </div>
          </section>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]"
        >
          <div className="theme-card p-5 sm:p-6">
            {error && (
              <div className="mb-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-black text-foreground">
                Quotation Information
              </h2>
              <p className="mt-1 text-sm text-muted">
                Add client, quotation title and service pricing items.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  Client <span className="text-red-500">*</span>
                </label>

                <select
                  value={form.client}
                  onChange={(e) => updateField("client", e.target.value)}
                  className="theme-input"
                >
                  <option value="">Select Client</option>

                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {getClientName(client)}
                      {getCompanyName(client)
                        ? ` - ${getCompanyName(client)}`
                        : ""}
                    </option>
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

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-black">
                  Quotation Title <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="theme-input pl-11"
                    placeholder="Example: Website Development Proposal"
                  />
                </div>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">Quotation Items</h3>
                  <p className="mt-1 text-sm text-muted">
                    Add service-wise pricing details.
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
                          placeholder="Short detail about this service item..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  Valid Till
                </label>

                <div className="relative">
                  <CalendarClock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    type="date"
                    value={form.validTill}
                    onChange={(e) => updateField("validTill", e.target.value)}
                    className="theme-input pl-11"
                  />
                </div>
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
                disabled={saving}
                className="theme-btn mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Quotation
                  </>
                )}
              </button>

              <Link
                href="/quotations"
                className="theme-btn-outline mt-3 w-full"
              >
                Cancel
              </Link>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary">
                <IndianRupee size={22} />
              </div>

              <p className="mt-4 text-sm font-black text-primary">
                Quotation Reminder
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Keep item titles and pricing clear so client can understand the
                proposal easily.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </DashboardLayout>
  );
}
