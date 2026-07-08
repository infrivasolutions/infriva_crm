"use client";
import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
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
const getCompanyName = (client) =>
  client?.companyName || client?.company || client?.businessName || "";
const formatAmount = (amount) => {
  const value = Number(amount || 0);
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};
function Field({ label, required, icon: Icon, children }) {
  return (
    <div>
      {" "}
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
        {" "}
        {Icon && <Icon size={15} className="text-primary" />} {label}{" "}
        {required && <span className="text-red-500">*</span>}{" "}
      </label>{" "}
      {children}{" "}
    </div>
  );
}
function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-6">
      {" "}
      <div className="mb-5 flex items-start justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h2 className="text-lg font-black text-foreground sm:text-xl">
            {" "}
            {title}{" "}
          </h2>{" "}
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
            {" "}
            {desc}{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          {" "}
          <Icon size={22} />{" "}
        </div>{" "}
      </div>{" "}
      {children}{" "}
    </section>
  );
}
function SelectedClientCard({ client }) {
  if (!client) return null;
  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-5">
      {" "}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />{" "}
      <div className="relative flex items-start gap-4">
        {" "}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-lg shadow-purple-100">
          {" "}
          <User size={22} />{" "}
        </div>{" "}
        <div className="min-w-0">
          {" "}
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            {" "}
            Selected Client{" "}
          </p>{" "}
          <h2 className="mt-1 truncate text-lg font-black text-foreground sm:text-xl">
            {" "}
            {getClientName(client)}{" "}
          </h2>{" "}
          <p className="mt-1 truncate text-sm font-semibold text-muted">
            {" "}
            {getCompanyName(client) || "No company added"}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </section>
  );
}
function AmountSummary({ totals, saving }) {
  return (
    <div className="theme-card p-4 sm:p-6">
      {" "}
      <div className="mb-5">
        {" "}
        <h2 className="text-lg font-black sm:text-xl">Amount Summary</h2>{" "}
        <p className="mt-1 text-xs text-muted sm:text-sm">
          {" "}
          Auto calculated quotation total{" "}
        </p>{" "}
      </div>{" "}
      <div className="space-y-3">
        {" "}
        <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
          {" "}
          <span className="text-sm font-bold text-muted">Sub Total</span>{" "}
          <span className="font-black text-foreground">
            {" "}
            {formatAmount(totals.subTotal)}{" "}
          </span>{" "}
        </div>{" "}
        <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
          {" "}
          <span className="text-sm font-bold text-muted">Discount</span>{" "}
          <span className="font-black text-foreground">
            {" "}
            - {formatAmount(totals.discount)}{" "}
          </span>{" "}
        </div>{" "}
        <div className="flex items-center justify-between rounded-2xl bg-surface-alt px-4 py-3">
          {" "}
          <span className="text-sm font-bold text-muted">Tax</span>{" "}
          <span className="font-black text-foreground">
            {" "}
            + {formatAmount(totals.tax)}{" "}
          </span>{" "}
        </div>{" "}
        <div className="relative overflow-hidden rounded-3xl bg-primary px-4 py-5 text-white">
          {" "}
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />{" "}
          <div className="relative flex items-center justify-between gap-3">
            {" "}
            <span className="text-sm font-black">Total</span>{" "}
            <span className="text-xl font-black sm:text-2xl">
              {" "}
              {formatAmount(totals.totalAmount)}{" "}
            </span>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
      <button
        type="submit"
        disabled={saving}
        className="theme-btn mt-5 hidden w-full disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
      >
        {" "}
        {saving ? (
          <>
            {" "}
            <Loader2 size={18} className="animate-spin" /> Creating...{" "}
          </>
        ) : (
          <>
            {" "}
            <Save size={18} /> Create Quotation{" "}
          </>
        )}{" "}
      </button>{" "}
      <Link
        href="/quotations"
        className="theme-btn-outline mt-3 hidden w-full sm:flex"
      >
        {" "}
        Cancel{" "}
      </Link>{" "}
    </div>
  );
}
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
    items: [{ title: "", description: "", price: "" }],
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
      setForm((prev) => ({ ...prev, client: selectedClient }));
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
    const totalAmount = Math.max(subTotal - discount + tax, 0);
    return { subTotal, discount, tax, totalAmount };
  }, [form.items, form.discount, form.tax]);
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const updateItem = (index, name, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [name]: value };
      return { ...prev, items };
    });
  };
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { title: "", description: "", price: "" }],
    }));
  };
  const removeItem = (index) => {
    setForm((prev) => {
      if (prev.items.length === 1) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
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
          description: item.description.trim(),
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
        notes: form.notes.trim(),
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
      <RoleGuard allowedRoles={["admin", "ads-manager"]}>
        {" "}
        <DashboardLayout>
          {" "}
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            {" "}
            <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
              {" "}
              <Loader2 className="animate-spin text-primary" size={36} />{" "}
              <h2 className="mt-4 text-xl font-black">
                {" "}
                Loading Quotation Form{" "}
              </h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                Fetching client details...{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </DashboardLayout>{" "}
      </RoleGuard>
    );
  }
  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      {" "}
      <DashboardLayout>
        {" "}
        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6"
        >
          {" "}
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            {" "}
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
            <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
              {" "}
              <div className="min-w-0">
                {" "}
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  {" "}
                  New Quotation{" "}
                </p>{" "}
                <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                  {" "}
                  Create Quotation{" "}
                </h1>{" "}
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                  {" "}
                  Prepare pricing proposal for website, CRM, SEO, automation or
                  custom IT services.{" "}
                </p>{" "}
              </div>{" "}
              <Link
                href="/quotations"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:w-fit sm:rounded-full"
              >
                {" "}
                <ArrowLeft size={18} /> Back to Quotations{" "}
              </Link>{" "}
            </div>{" "}
          </section>{" "}
          {error && (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {" "}
              <AlertCircle size={18} className="shrink-0" />{" "}
              <span>{error}</span>{" "}
            </div>
          )}{" "}
          <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr] xl:gap-6">
            {" "}
            <div className="space-y-5 sm:space-y-6">
              {" "}
              <FormSection
                title="Quotation Information"
                desc="Add client, quotation title and proposal status."
                icon={FileText}
              >
                {" "}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {" "}
                  <Field label="Client" required icon={User}>
                    {" "}
                    <select
                      value={form.client}
                      onChange={(e) => updateField("client", e.target.value)}
                      className="theme-input"
                    >
                      {" "}
                      <option value="">Select Client</option>{" "}
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {" "}
                          {getClientName(client)}{" "}
                          {getCompanyName(client)
                            ? ` - ${getCompanyName(client)}`
                            : ""}{" "}
                        </option>
                      ))}{" "}
                    </select>{" "}
                  </Field>{" "}
                  <Field label="Status" icon={FileText}>
                    {" "}
                    <select
                      value={form.status}
                      onChange={(e) => updateField("status", e.target.value)}
                      className="theme-input"
                    >
                      {" "}
                      {statusOptions.map((item) => (
                        <option key={item}>{item}</option>
                      ))}{" "}
                    </select>{" "}
                  </Field>{" "}
                  <Field
                    label="Quotation Title"
                    required
                    icon={FileText}
                    className="sm:col-span-2"
                  >
                    {" "}
                    <div className="relative">
                      {" "}
                      <FileText
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      />{" "}
                      <input
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        className="theme-input pl-11"
                        placeholder="Website Development Proposal"
                      />{" "}
                    </div>{" "}
                  </Field>{" "}
                </div>{" "}
              </FormSection>{" "}
              <FormSection
                title="Quotation Items"
                desc="Add service-wise pricing details."
                icon={IndianRupee}
              >
                {" "}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {" "}
                  <div>
                    {" "}
                    <h3 className="text-base font-black text-foreground">
                      {" "}
                      Pricing Items{" "}
                    </h3>{" "}
                    <p className="mt-1 text-xs text-muted sm:text-sm">
                      {" "}
                      Add one or more services with price.{" "}
                    </p>{" "}
                  </div>{" "}
                  <button
                    type="button"
                    onClick={addItem}
                    className="theme-btn-outline w-full sm:w-fit"
                  >
                    {" "}
                    <Plus size={17} /> Add Item{" "}
                  </button>{" "}
                </div>{" "}
                <div className="space-y-4">
                  {" "}
                  {form.items.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-border bg-surface-alt p-4 sm:rounded-3xl"
                    >
                      {" "}
                      <div className="mb-4 flex items-center justify-between gap-3">
                        {" "}
                        <p className="text-sm font-black text-primary">
                          {" "}
                          Item #{index + 1}{" "}
                        </p>{" "}
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {" "}
                          <Trash2 size={17} />{" "}
                        </button>{" "}
                      </div>{" "}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
                        {" "}
                        <Field label="Item Title">
                          {" "}
                          <input
                            value={item.title}
                            onChange={(e) =>
                              updateItem(index, "title", e.target.value)
                            }
                            className="theme-input bg-white"
                            placeholder="Website Design"
                          />{" "}
                        </Field>{" "}
                        <Field label="Price">
                          {" "}
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(index, "price", e.target.value)
                            }
                            className="theme-input bg-white"
                            placeholder="25000"
                          />{" "}
                        </Field>{" "}
                        <Field label="Description" className="sm:col-span-2">
                          {" "}
                          <textarea
                            value={item.description}
                            onChange={(e) =>
                              updateItem(index, "description", e.target.value)
                            }
                            className="theme-input min-h-24 resize-none bg-white"
                            placeholder="Short detail about this service item..."
                          />{" "}
                        </Field>{" "}
                      </div>{" "}
                    </div>
                  ))}{" "}
                </div>{" "}
              </FormSection>{" "}
              <FormSection
                title="Terms & Notes"
                desc="Add validity, tax, discount and payment/project notes."
                icon={CalendarClock}
              >
                {" "}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {" "}
                  <Field label="Valid Till" icon={CalendarClock}>
                    {" "}
                    <div className="relative">
                      {" "}
                      <CalendarClock
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                      />{" "}
                      <input
                        type="date"
                        value={form.validTill}
                        onChange={(e) =>
                          updateField("validTill", e.target.value)
                        }
                        className="theme-input pl-11"
                      />{" "}
                    </div>{" "}
                  </Field>{" "}
                  <Field label="Tax" icon={IndianRupee}>
                    {" "}
                    <input
                      type="number"
                      value={form.tax}
                      onChange={(e) => updateField("tax", e.target.value)}
                      className="theme-input"
                      placeholder="0"
                    />{" "}
                  </Field>{" "}
                  <Field label="Discount" icon={IndianRupee}>
                    {" "}
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => updateField("discount", e.target.value)}
                      className="theme-input"
                      placeholder="0"
                    />{" "}
                  </Field>{" "}
                  <Field
                    label="Notes"
                    icon={FileText}
                    className="sm:col-span-2"
                  >
                    {" "}
                    <textarea
                      value={form.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      className="theme-input min-h-28 resize-none"
                      placeholder="Payment terms, timeline, project notes..."
                    />{" "}
                  </Field>{" "}
                </div>{" "}
              </FormSection>{" "}
            </div>{" "}
            <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
              {" "}
              <SelectedClientCard client={selectedClient} />{" "}
              <AmountSummary totals={totals} saving={saving} />{" "}
              <div className="rounded-4xl border border-border bg-primary-light p-5">
                {" "}
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary">
                  {" "}
                  <IndianRupee size={22} />{" "}
                </div>{" "}
                <p className="mt-4 text-sm font-black text-primary">
                  {" "}
                  Quotation Reminder{" "}
                </p>{" "}
                <p className="mt-2 text-sm leading-7 text-muted">
                  {" "}
                  Keep item titles and pricing clear so client can understand
                  the proposal easily.{" "}
                </p>{" "}
              </div>{" "}
            </aside>{" "}
          </section>{" "}
          <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
            {" "}
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-primary-light px-4 py-3">
              {" "}
              <span className="text-xs font-black text-primary">
                Total
              </span>{" "}
              <span className="text-sm font-black text-primary">
                {" "}
                {formatAmount(totals.totalAmount)}{" "}
              </span>{" "}
            </div>{" "}
            <div className="grid grid-cols-2 gap-3">
              {" "}
              <Link
                href="/quotations"
                className="theme-btn-outline rounded-2xl text-xs"
              >
                {" "}
                Cancel{" "}
              </Link>{" "}
              <button
                type="submit"
                disabled={saving}
                className="theme-btn rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
              >
                {" "}
                {saving ? (
                  <>
                    {" "}
                    <Loader2 size={16} className="animate-spin" /> Creating{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <Save size={16} /> Create{" "}
                  </>
                )}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </form>{" "}
      </DashboardLayout>{" "}
    </RoleGuard>
  );
}
