"use client";
import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
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
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";
const getCompanyName = (client) =>
  client?.companyName || client?.company || "No company added";
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-alt p-4">
      {" "}
      <div className="flex items-start gap-3">
        {" "}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          {" "}
          <Icon size={18} />{" "}
        </div>{" "}
        <div className="min-w-0">
          {" "}
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            {" "}
            {label}{" "}
          </p>{" "}
          <p className="mt-1 break-words text-sm font-bold text-foreground">
            {" "}
            {value || "—"}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
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
        {" "}
        <div className="flex min-h-[70vh] items-center justify-center">
          {" "}
          <div className="theme-card flex flex-col items-center p-8 text-center">
            {" "}
            <Loader2 className="animate-spin text-primary" size={36} />{" "}
            <h2 className="mt-4 text-xl font-black">Loading Client</h2>{" "}
            <p className="mt-2 text-sm text-muted">
              {" "}
              Fetching complete client details...{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  if (error && !client) {
    return (
      <DashboardLayout>
        {" "}
        <div className="flex min-h-[70vh] items-center justify-center">
          {" "}
          <div className="theme-card max-w-md p-8 text-center">
            {" "}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {" "}
              <AlertCircle size={26} />{" "}
            </div>{" "}
            <h2 className="mt-4 text-xl font-black">Client Error</h2>{" "}
            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>{" "}
            <div className="mt-5 flex justify-center gap-3">
              {" "}
              <Link href="/clients" className="theme-btn-outline">
                {" "}
                Back{" "}
              </Link>{" "}
              <button onClick={fetchClient} className="theme-btn">
                {" "}
                Try Again{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-6">
        {" "}
        <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200">
          {" "}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            {" "}
            <div>
              {" "}
              <Link
                href="/clients"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                {" "}
                <ArrowLeft size={17} /> Back to Clients{" "}
              </Link>{" "}
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                {" "}
                Client Detail{" "}
              </p>{" "}
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {" "}
                {getClientName(client)}{" "}
              </h1>{" "}
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                {" "}
                {getCompanyName(client)}{" "}
              </p>{" "}
              <div className="mt-5 flex flex-wrap gap-2">
                {" "}
                <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-primary">
                  {" "}
                  Active Client{" "}
                </span>{" "}
                {client?.lead && (
                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                    {" "}
                    Converted From Lead{" "}
                  </span>
                )}{" "}
                <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                  {" "}
                  Added {formatDate(client?.createdAt)}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
            <div className="flex flex-wrap gap-3">
              {" "}
              {client?.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
                >
                  {" "}
                  <Phone size={18} /> Call{" "}
                </a>
              )}{" "}
              {client?.phone && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  {" "}
                  <MessageCircle size={18} /> WhatsApp{" "}
                </a>
              )}{" "}
              {client?.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  {" "}
                  <Mail size={18} /> Email{" "}
                </a>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {" "}
            {error}{" "}
          </div>
        )}{" "}
        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          {" "}
          <div className="space-y-6">
            {" "}
            <div className="theme-card p-5 sm:p-6">
              {" "}
              <div className="mb-5 flex items-center justify-between">
                {" "}
                <div>
                  {" "}
                  <h2 className="text-xl font-black">
                    Client Information
                  </h2>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    Contact and company details{" "}
                  </p>{" "}
                </div>{" "}
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  {" "}
                  <User size={22} />{" "}
                </div>{" "}
              </div>{" "}
              <div className="grid gap-4 md:grid-cols-2">
                {" "}
                <DetailItem
                  icon={User}
                  label="Client Name"
                  value={getClientName(client)}
                />{" "}
                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={getCompanyName(client)}
                />{" "}
                <DetailItem icon={Phone} label="Phone" value={client?.phone} />{" "}
                <DetailItem icon={Mail} label="Email" value={client?.email} />{" "}
                <DetailItem
                  icon={UserCog}
                  label="Assigned To"
                  value={
                    client?.assignedTo?.name ||
                    client?.assignedTo?.email ||
                    "Not assigned"
                  }
                />{" "}
                <DetailItem
                  icon={CalendarClock}
                  label="Created At"
                  value={formatDate(client?.createdAt)}
                />{" "}
              </div>{" "}
            </div>{" "}
            {client?.lead && (
              <div className="theme-card p-5 sm:p-6">
                {" "}
                <div className="mb-5">
                  {" "}
                  <h2 className="text-xl font-black">Original Lead</h2>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    Source lead information before conversion{" "}
                  </p>{" "}
                </div>{" "}
                <div className="grid gap-4 md:grid-cols-2">
                  {" "}
                  <DetailItem
                    icon={Sparkles}
                    label="Lead Service"
                    value={client?.lead?.service}
                  />{" "}
                  <DetailItem
                    icon={FileText}
                    label="Lead Budget"
                    value={client?.lead?.budget}
                  />{" "}
                  <DetailItem
                    icon={MessageCircle}
                    label="Lead Source"
                    value={client?.lead?.source}
                  />{" "}
                  <DetailItem
                    icon={CalendarClock}
                    label="Lead Created"
                    value={formatDate(client?.lead?.createdAt)}
                  />{" "}
                </div>{" "}
                {client?.lead?._id && (
                  <div className="mt-5">
                    {" "}
                    <Link
                      href={`/leads/${client.lead._id}`}
                      className="theme-btn-outline"
                    >
                      {" "}
                      View Original Lead{" "}
                    </Link>{" "}
                  </div>
                )}{" "}
              </div>
            )}{" "}
            <div className="theme-card p-5 sm:p-6">
              {" "}
              <div className="mb-5">
                {" "}
                <h2 className="text-xl font-black">
                  Client Work Overview
                </h2>{" "}
                <p className="mt-1 text-sm text-muted">
                  {" "}
                  Projects and quotations will be connected here.{" "}
                </p>{" "}
              </div>{" "}
              <div className="grid gap-4 md:grid-cols-2">
                {" "}
                <div className="rounded-2xl border border-border bg-surface-alt p-5">
                  {" "}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
                    {" "}
                    <FolderKanban size={22} />{" "}
                  </div>{" "}
                  <h3 className="mt-4 text-lg font-black">Projects</h3>{" "}
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {" "}
                    Create and manage client projects from this CRM.{" "}
                  </p>{" "}
                  <Link
                    href={`/projects/new?client=${client?._id}`}
                    className="mt-4 inline-flex text-sm font-black text-primary"
                  >
                    {" "}
                    Create Project{" "}
                  </Link>{" "}
                </div>{" "}
                <div className="rounded-2xl border border-border bg-surface-alt p-5">
                  {" "}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
                    {" "}
                    <FileText size={22} />{" "}
                  </div>{" "}
                  <h3 className="mt-4 text-lg font-black">Quotations</h3>{" "}
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {" "}
                    Prepare quotations and proposals for this client.{" "}
                  </p>{" "}
                  <Link
                    href={`/quotations/new?client=${client?._id}`}
                    className="mt-4 inline-flex text-sm font-black text-primary"
                  >
                    {" "}
                    Create Quotation{" "}
                  </Link>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <aside className="space-y-6">
            {" "}
            <div className="theme-card p-5 sm:p-6">
              {" "}
              <div className="mb-5">
                {" "}
                <h2 className="text-xl font-black">Quick Actions</h2>{" "}
                <p className="mt-1 text-sm text-muted">
                  {" "}
                  Start client work quickly{" "}
                </p>{" "}
              </div>{" "}
              <div className="space-y-3">
                {" "}
                <Link
                  href={`/projects/new?client=${client?._id}`}
                  className="theme-btn w-full"
                >
                  {" "}
                  <FolderKanban size={18} /> New Project{" "}
                </Link>{" "}
                <Link
                  href={`/quotations/new?client=${client?._id}`}
                  className="theme-btn-outline w-full"
                >
                  {" "}
                  <FileText size={18} /> New Quotation{" "}
                </Link>{" "}
                <button
                  onClick={fetchClient}
                  className="theme-btn-outline w-full"
                >
                  {" "}
                  <RefreshCcw size={18} /> Refresh Client{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <div className="rounded-[2rem] border border-border bg-primary-light p-5">
              {" "}
              <p className="text-sm font-black text-primary">
                Client Reminder
              </p>{" "}
              <p className="mt-2 text-sm leading-7 text-muted">
                {" "}
                After converting a lead to client, create a project or quotation
                immediately so delivery and sales tracking stay connected.{" "}
              </p>{" "}
            </div>{" "}
          </aside>{" "}
        </section>{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
