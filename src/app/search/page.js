"use client";
import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  Building2,
  FileText,
  FolderKanban,
  ListTodo,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
const initialResults = {
  leads: [],
  clients: [],
  projects: [],
  quotations: [],
  tasks: [],
};
const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
function ResultSection({ title, icon: Icon, items, emptyText, children }) {
  return (
    <section className="theme-card p-5 sm:p-6">
      {" "}
      <div className="mb-5 flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h2 className="text-xl font-black">{title}</h2>{" "}
          <p className="mt-1 text-sm text-muted">
            {" "}
            {items.length} result{items.length === 1 ? "" : "s"} found{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
          {" "}
          <Icon size={22} />{" "}
        </div>{" "}
      </div>{" "}
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface-alt p-6 text-center">
          {" "}
          <p className="text-sm font-bold text-muted">{emptyText}</p>{" "}
        </div>
      ) : (
        <div className="grid gap-3">{children}</div>
      )}{" "}
    </section>
  );
}
function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [query, setQuery] = useState(queryFromUrl);
  const [results, setResults] = useState(initialResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchSearchResults = async (searchValue) => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch(
        `/search?q=${encodeURIComponent(searchValue)}`,
      );
      setResults({
        leads: res?.data?.leads || [],
        clients: res?.data?.clients || [],
        projects: res?.data?.projects || [],
        quotations: res?.data?.quotations || [],
        tasks: res?.data?.tasks || [],
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
      setError(err?.message || "Search failed");
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
    setQuery(queryFromUrl);
    if (queryFromUrl.trim()) {
      fetchSearchResults(queryFromUrl.trim());
    } else {
      setResults(initialResults);
      setError("");
    }
  }, [queryFromUrl, router]);
  const totalResults = useMemo(() => {
    return (
      results.leads.length +
      results.clients.length +
      results.projects.length +
      results.quotations.length +
      results.tasks.length
    );
  }, [results]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-6">
        {" "}
        <section className="rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200">
          {" "}
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
            {" "}
            CRM Search{" "}
          </p>{" "}
          <h1 className="mt-2 text-3xl font-black">Global Search</h1>{" "}
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
            {" "}
            Search leads, clients, projects, quotations and tasks from one
            place.{" "}
          </p>{" "}
          <form onSubmit={handleSubmit} className="mt-6 max-w-3xl">
            {" "}
            <div className="relative">
              {" "}
              <Search
                size={20}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted"
              />{" "}
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-14 w-full rounded-full border border-white/20 bg-white px-14 text-base font-bold text-foreground outline-none"
                placeholder="Search leads, clients, projects..."
              />{" "}
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-3 text-sm font-black text-white"
              >
                {" "}
                Search{" "}
              </button>{" "}
            </div>{" "}
          </form>{" "}
        </section>{" "}
        {loading ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8">
            {" "}
            <div className="text-center">
              {" "}
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />{" "}
              <h2 className="mt-4 text-xl font-black">Searching CRM</h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                Finding matching records...{" "}
              </p>{" "}
            </div>{" "}
          </div>
        ) : error ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            {" "}
            <div>
              {" "}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                {" "}
                <AlertCircle size={26} />{" "}
              </div>{" "}
              <h2 className="mt-4 text-xl font-black">Search Error</h2>{" "}
              <p className="mt-2 text-sm text-muted">{error}</p>{" "}
            </div>{" "}
          </div>
        ) : !queryFromUrl ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            {" "}
            <div>
              {" "}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                {" "}
                <Search size={26} />{" "}
              </div>{" "}
              <h2 className="mt-4 text-xl font-black">Start Searching</h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                Enter a keyword to search your CRM.{" "}
              </p>{" "}
            </div>{" "}
          </div>
        ) : totalResults === 0 ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            {" "}
            <div>
              {" "}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                {" "}
                <Search size={26} />{" "}
              </div>{" "}
              <h2 className="mt-4 text-xl font-black">No results found</h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                No CRM records matched “{queryFromUrl}”.{" "}
              </p>{" "}
            </div>{" "}
          </div>
        ) : (
          <div className="space-y-6">
            {" "}
            <div className="theme-card-soft p-5">
              {" "}
              <p className="text-sm font-bold text-muted">
                Search Results
              </p>{" "}
              <h2 className="mt-1 text-2xl font-black">
                {" "}
                {totalResults} result{totalResults === 1 ? "" : "s"} for “{" "}
                {queryFromUrl}”{" "}
              </h2>{" "}
            </div>{" "}
            <ResultSection
              title="Leads"
              icon={Users}
              items={results.leads}
              emptyText="No matching leads."
            >
              {" "}
              {results.leads.map((lead) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="rounded-2xl border border-border bg-surface-alt p-4 transition hover:bg-primary-light"
                >
                  {" "}
                  <p className="font-black">{lead.clientName}</p>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    {lead.service} · {lead.phone} · {lead.status}{" "}
                  </p>{" "}
                </Link>
              ))}{" "}
            </ResultSection>{" "}
            <ResultSection
              title="Clients"
              icon={Building2}
              items={results.clients}
              emptyText="No matching clients."
            >
              {" "}
              {results.clients.map((client) => (
                <Link
                  key={client._id}
                  href={`/clients/${client._id}`}
                  className="rounded-2xl border border-border bg-surface-alt p-4 transition hover:bg-primary-light"
                >
                  {" "}
                  <p className="font-black">{client.clientName}</p>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    {client.companyName || "No company"} · {client.phone}{" "}
                  </p>{" "}
                </Link>
              ))}{" "}
            </ResultSection>{" "}
            <ResultSection
              title="Projects"
              icon={FolderKanban}
              items={results.projects}
              emptyText="No matching projects."
            >
              {" "}
              {results.projects.map((project) => (
                <Link
                  key={project._id}
                  href={`/projects/${project._id}`}
                  className="rounded-2xl border border-border bg-surface-alt p-4 transition hover:bg-primary-light"
                >
                  {" "}
                  <p className="font-black">{project.projectName}</p>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    {project.service} · {project.status} ·{" "}
                    {project.client?.clientName || "No client"}{" "}
                  </p>{" "}
                </Link>
              ))}{" "}
            </ResultSection>{" "}
            <ResultSection
              title="Quotations"
              icon={FileText}
              items={results.quotations}
              emptyText="No matching quotations."
            >
              {" "}
              {results.quotations.map((quotation) => (
                <Link
                  key={quotation._id}
                  href={`/quotations/${quotation._id}`}
                  className="rounded-2xl border border-border bg-surface-alt p-4 transition hover:bg-primary-light"
                >
                  {" "}
                  <p className="font-black">
                    {" "}
                    {quotation.quotationNo || quotation.title}{" "}
                  </p>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    {quotation.title} · {quotation.status} ·{" "}
                    {quotation.client?.clientName || "No client"}{" "}
                  </p>{" "}
                </Link>
              ))}{" "}
            </ResultSection>{" "}
            <ResultSection
              title="Tasks"
              icon={ListTodo}
              items={results.tasks}
              emptyText="No matching tasks."
            >
              {" "}
              {results.tasks.map((task) => (
                <Link
                  key={task._id}
                  href={`/tasks/${task._id}`}
                  className="rounded-2xl border border-border bg-surface-alt p-4 transition hover:bg-primary-light"
                >
                  {" "}
                  <p className="font-black">{task.title}</p>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    {task.status} · {task.priority} · Due{" "}
                    {formatDate(task.dueDate)}{" "}
                  </p>{" "}
                </Link>
              ))}{" "}
            </ResultSection>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          {" "}
          <div className="theme-card flex min-h-80 items-center justify-center p-8">
            {" "}
            <div className="text-center">
              {" "}
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />{" "}
              <h2 className="mt-4 text-xl font-black">Loading Search</h2>{" "}
              <p className="mt-2 text-sm text-muted">Please wait...</p>{" "}
            </div>{" "}
          </div>{" "}
        </DashboardLayout>
      }
    >
      {" "}
      <SearchPageContent />{" "}
    </Suspense>
  );
}
