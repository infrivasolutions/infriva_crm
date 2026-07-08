"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
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

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ResultSection({ title, icon: Icon, items, emptyText, children }) {
  return (
    <section className="theme-card p-4 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-black sm:text-xl">{title}</h2>

          <p className="mt-1 text-xs text-muted sm:text-sm">
            {items.length} result{items.length === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Icon size={22} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface-alt p-6 text-center">
          <p className="text-sm font-bold text-muted">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
}

function ResultCard({ href, icon: Icon, title, badge, lines = [] }) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-purple-100 sm:rounded-3xl"
    >
      <div className="relative overflow-hidden bg-primary-light p-3 sm:p-4">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm sm:h-11 sm:w-11">
              <Icon size={18} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xs font-black text-foreground sm:text-base">
                {title || "Untitled"}
              </h3>

              {badge && (
                <p className="mt-1 truncate text-[10px] font-black text-primary sm:text-xs">
                  {badge}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="space-y-2 rounded-2xl bg-surface-alt p-3">
          {lines.filter(Boolean).map((line, index) => (
            <p
              key={index}
              className="truncate text-[10px] font-bold text-muted sm:text-xs"
            >
              {line}
            </p>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] font-black text-primary sm:text-xs">
          <span>Open</span>

          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
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

  const resultStats = [
    {
      label: "Leads",
      value: results.leads.length,
      icon: Users,
    },
    {
      label: "Clients",
      value: results.clients.length,
      icon: Building2,
    },
    {
      label: "Projects",
      value: results.projects.length,
      icon: FolderKanban,
    },
    {
      label: "Quotes",
      value: results.quotations.length,
      icon: FileText,
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const value = query.trim();
    if (!value) return;

    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
              CRM Search
            </p>

            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
              Global Search
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Search leads, clients, projects, quotations and tasks from one
              place.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 max-w-3xl">
              <div className="grid gap-3 rounded-3xl bg-white/10 p-2 backdrop-blur sm:grid-cols-[1fr_auto] sm:rounded-full">
                <div className="relative">
                  <Search
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-white/20 bg-white pl-11 pr-4 text-sm font-bold text-foreground outline-none sm:h-13 sm:rounded-full"
                    placeholder="Search leads, clients, projects..."
                  />
                </div>

                <button
                  type="submit"
                  className="h-12 rounded-2xl bg-primary-light px-6 text-sm font-black text-primary transition hover:bg-white sm:h-13 sm:rounded-full"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {loading ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />

              <h2 className="mt-4 text-xl font-black">Searching CRM</h2>

              <p className="mt-2 text-sm text-muted">
                Finding matching records...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">Search Error</h2>

              <p className="mt-2 text-sm text-muted">{error}</p>
            </div>
          </div>
        ) : !queryFromUrl ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Search size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">Start Searching</h2>

              <p className="mt-2 text-sm text-muted">
                Enter a keyword to search your CRM.
              </p>
            </div>
          </div>
        ) : totalResults === 0 ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Search size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">No results found</h2>

              <p className="mt-2 text-sm text-muted">
                No CRM records matched “{queryFromUrl}”.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            <div className="theme-card-soft p-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-wider text-primary">
                Search Results
              </p>

              <h2 className="mt-1 wrap-break-word text-xl font-black sm:text-2xl">
                {totalResults} result{totalResults === 1 ? "" : "s"} for “
                {queryFromUrl}”
              </h2>
            </div>

            <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {resultStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-3xl border border-border bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
                          {stat.label}
                        </p>

                        <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
                          {stat.value}
                        </h3>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                        <Icon size={19} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <ResultSection
              title="Leads"
              icon={Users}
              items={results.leads}
              emptyText="No matching leads."
            >
              {results.leads.map((lead) => (
                <ResultCard
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  icon={Users}
                  title={lead.clientName || lead.name || "Unnamed Lead"}
                  badge={lead.status || "Lead"}
                  lines={[
                    lead.service || lead.serviceInterested || "No service",
                    lead.phone || lead.email || "No contact",
                  ]}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="Clients"
              icon={Building2}
              items={results.clients}
              emptyText="No matching clients."
            >
              {results.clients.map((client) => (
                <ResultCard
                  key={client._id}
                  href={`/clients/${client._id}`}
                  icon={Building2}
                  title={client.clientName || client.name || "Unnamed Client"}
                  badge="Client"
                  lines={[
                    client.companyName || client.company || "No company",
                    client.phone || client.email || "No contact",
                  ]}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="Projects"
              icon={FolderKanban}
              items={results.projects}
              emptyText="No matching projects."
            >
              {results.projects.map((project) => (
                <ResultCard
                  key={project._id}
                  href={`/projects/${project._id}`}
                  icon={FolderKanban}
                  title={project.projectName || "Untitled Project"}
                  badge={project.status || "Project"}
                  lines={[
                    project.service || "No service",
                    project.client?.clientName ||
                      project.client?.name ||
                      "No client",
                  ]}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="Quotations"
              icon={FileText}
              items={results.quotations}
              emptyText="No matching quotations."
            >
              {results.quotations.map((quotation) => (
                <ResultCard
                  key={quotation._id}
                  href={`/quotations/${quotation._id}`}
                  icon={FileText}
                  title={
                    quotation.quotationNo ||
                    quotation.quoteNo ||
                    quotation.title ||
                    "Untitled Quotation"
                  }
                  badge={quotation.status || "Quotation"}
                  lines={[
                    quotation.title || quotation.service || "No title",
                    quotation.client?.clientName ||
                      quotation.client?.name ||
                      "No client",
                  ]}
                />
              ))}
            </ResultSection>

            <ResultSection
              title="Tasks"
              icon={ListTodo}
              items={results.tasks}
              emptyText="No matching tasks."
            >
              {results.tasks.map((task) => (
                <ResultCard
                  key={task._id}
                  href={`/tasks/${task._id}`}
                  icon={ListTodo}
                  title={task.title || "Untitled Task"}
                  badge={task.status || "Task"}
                  lines={[
                    task.priority || "No priority",
                    `Due ${formatDate(task.dueDate)}`,
                  ]}
                />
              ))}
            </ResultSection>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="theme-card flex min-h-80 items-center justify-center p-8">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />

              <h2 className="mt-4 text-xl font-black">Loading Search</h2>

              <p className="mt-2 text-sm text-muted">Please wait...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
