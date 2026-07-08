"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/crm/DashboardLayout";
import StatCard from "@/components/crm/StatCard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderKanban,
  IndianRupee,
  ListTodo,
  Loader2,
  PhoneCall,
  RefreshCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
const getLeadName = (lead) =>
  lead?.clientName || lead?.name || lead?.fullName || "Unnamed Lead";
const getLeadSource = (lead) =>
  lead?.source || lead?.leadSource || lead?.lead_source || "Manual";
const getLeadService = (lead) =>
  lead?.serviceInterested ||
  lead?.service ||
  lead?.serviceRequired ||
  lead?.requirement ||
  "Not specified";
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
  if (value.includes("contacted") || value.includes("interested")) {
    return "bg-blue-50 text-blue-700";
  }
  return "bg-primary-light text-primary";
};
function EmptyState({ title, desc }) {
  return (
    <div className="flex min-h-55 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface-alt p-6 text-center">
      {" "}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
        {" "}
        <AlertCircle size={24} />{" "}
      </div>{" "}
      <h3 className="text-lg font-black text-foreground">{title}</h3>{" "}
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{desc}</p>{" "}
    </div>
  );
}
function AnalyticsBars({ title, data = [] }) {
  const maxCount = Math.max(...data.map((item) => item.count || 0), 1);
  return (
    <div className="theme-card p-5">
      {" "}
      <div className="mb-5 flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h3 className="text-lg font-black">{title}</h3>{" "}
          <p className="mt-1 text-sm text-muted">Live CRM analytics</p>{" "}
        </div>{" "}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
          {" "}
          <BarChart3 size={21} />{" "}
        </div>{" "}
      </div>{" "}
      {data.length === 0 ? (
        <EmptyState
          title="No analytics yet"
          desc="Once leads are added, this chart will show useful data here."
        />
      ) : (
        <div className="space-y-4">
          {" "}
          {data.map((item) => {
            const label = item?._id || "Unknown";
            const percent = ((item.count || 0) / maxCount) * 100;
            return (
              <div key={label}>
                {" "}
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  {" "}
                  <p className="font-bold text-foreground">{label}</p>{" "}
                  <p className="font-black text-primary">{item.count}</p>{" "}
                </div>{" "}
                <div className="h-3 overflow-hidden rounded-full bg-primary-light">
                  {" "}
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                  />{" "}
                </div>{" "}
              </div>
            );
          })}{" "}
        </div>
      )}{" "}
    </div>
  );
}

function LeadTable({ leads = [] }) {
  return (
    <div className="theme-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h3 className="text-base font-black sm:text-lg">Recent Leads</h3>
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
            Latest enquiries from website, Meta, WhatsApp and manual entries
          </p>
        </div>

        <Link
          href="/leads"
          className="inline-flex w-fit items-center gap-1 rounded-full bg-primary-light px-4 py-2 text-xs font-black text-primary transition hover:bg-primary hover:text-white sm:text-sm"
        >
          View All
          <ArrowRight size={15} />
        </Link>
      </div>

      {leads.length === 0 ? (
        <div className="p-4 sm:p-5">
          <EmptyState
            title="No leads found"
            desc="Add your first lead to start tracking enquiries."
          />
        </div>
      ) : (
        <>
          {/* Mobile Card View - unchanged */}
          <div className="grid grid-cols-1 gap-3 p-4 sm:hidden">
            {leads.map((lead) => (
              <Link
                key={lead._id}
                href={`/leads/${lead._id}`}
                className="group rounded-3xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-purple-100"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                      <Users size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-foreground">
                        {getLeadName(lead)}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted">
                        {lead?.phone || lead?.email || "No contact"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${getStatusClass(
                      lead?.status,
                    )}`}
                  >
                    {lead?.status || "New"}
                  </span>
                </div>

                <div className="space-y-3 rounded-2xl bg-surface-alt p-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                      Service
                    </p>
                    <p className="mt-1 line-clamp-1 text-xs font-bold text-foreground">
                      {getLeadService(lead)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                        Source
                      </p>
                      <p className="mt-1 truncate text-xs font-bold text-foreground">
                        {getLeadSource(lead)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                        Created
                      </p>
                      <p className="mt-1 text-xs font-bold text-foreground">
                        {lead?.createdAt
                          ? new Date(lead.createdAt).toLocaleDateString("en-IN")
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-black text-primary">
                  <span>Open Lead</span>
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop / Tablet Card View */}
          <div className="hidden grid-cols-2 gap-4 p-5 sm:grid">
            {leads.map((lead) => (
              <Link
                key={lead._id}
                href={`/leads/${lead._id}`}
                className="group relative overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-purple-100"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-lg shadow-purple-100">
                      <Users size={21} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-base font-black text-foreground">
                        {getLeadName(lead)}
                      </h4>

                      <p className="mt-1 truncate text-xs font-bold text-muted">
                        {lead?.phone || lead?.email || "No contact"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${getStatusClass(
                      lead?.status,
                    )}`}
                  >
                    {lead?.status || "New"}
                  </span>
                </div>

                <div className="relative mt-4 rounded-2xl bg-surface-alt p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                        Service
                      </p>

                      <p className="mt-1 truncate text-sm font-black text-foreground">
                        {getLeadService(lead)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">
                        Source
                      </p>

                      <p className="mt-1 truncate text-sm font-black text-primary">
                        {getLeadSource(lead)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-[11px] font-black text-primary">
                    <PhoneCall size={13} />
                    {lead?.phone || "No phone"}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-alt px-3 py-1 text-[11px] font-black text-foreground">
                    <CalendarClock size={13} />
                    {lead?.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>

                <div className="relative mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-black text-primary">
                  <span>View Details</span>

                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UpcomingTasks({ tasks = [] }) {
  return (
    <div className="theme-card p-5">
      {" "}
      <div className="mb-5 flex items-center justify-between">
        {" "}
        <div>
          {" "}
          <h3 className="text-lg font-black">Upcoming Tasks</h3>{" "}
          <p className="mt-1 text-sm text-muted">Next 7 days work</p>{" "}
        </div>{" "}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
          {" "}
          <CalendarClock size={21} />{" "}
        </div>{" "}
      </div>{" "}
      {tasks.length === 0 ? (
        <EmptyState
          title="No upcoming tasks"
          desc="Tasks with due dates will appear here."
        />
      ) : (
        <div className="space-y-4">
          {" "}
          {tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-2xl border border-border bg-surface-alt p-4"
            >
              {" "}
              <div className="flex gap-3">
                {" "}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                  {" "}
                  <ListTodo size={18} />{" "}
                </div>{" "}
                <div className="min-w-0">
                  {" "}
                  <p className="truncate font-black text-foreground">
                    {" "}
                    {task?.title || task?.taskName || "Untitled Task"}{" "}
                  </p>{" "}
                  <p className="mt-1 text-sm text-muted">
                    {" "}
                    {task?.project?.projectName || "No project"}{" "}
                    {task?.assignedTo?.name
                      ? ` · ${task.assignedTo.name}`
                      : ""}{" "}
                  </p>{" "}
                  <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    {" "}
                    <CalendarClock size={14} />{" "}
                    {task?.dueDate
                      ? new Date(task.dueDate).toLocaleDateString("en-IN")
                      : "No due date"}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const dashboardRes = await apiFetch("/dashboard");
      setDashboard(dashboardRes?.data || null);

      const role = dashboardRes?.data?.role;

      if (role === "admin" || role === "ads-manager") {
        const analyticsRes = await apiFetch("/dashboard/analytics");
        setAnalytics(analyticsRes?.data || null);
      }
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

      setError(err?.message || "Failed to load dashboard");
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

    setCheckingAuth(false);
    fetchDashboard();
  }, [router]);

  const role = dashboard?.role;
  const isAdminView = role === "admin" || role === "ads-manager";

  const cards = useMemo(() => {
    const cardData = dashboard?.cards || {};

    if (isAdminView) {
      return [
        {
          title: "Total Leads",
          value: cardData.leads || 0,
          subtitle: "All business enquiries",
          trend: analytics
            ? `${analytics.conversionRate || 0}% conversion`
            : "",
          icon: Users,
          tone: "primary",
        },
        {
          title: "Clients",
          value: cardData.clients || 0,
          subtitle: "Converted active clients",
          trend: "CRM records",
          icon: Building2,
          tone: "green",
        },
        {
          title: "Projects",
          value: cardData.projects || 0,
          subtitle: "All created projects",
          trend: "Delivery pipeline",
          icon: FolderKanban,
          tone: "blue",
        },
        {
          title: "Quotations",
          value: cardData.quotations || 0,
          subtitle: "Sent and pending quotes",
          trend: "Sales follow-up",
          icon: FileText,
          tone: "amber",
        },
        {
          title: "Tasks",
          value: cardData.tasks || 0,
          subtitle: "Team workload",
          trend: "Project execution",
          icon: ListTodo,
          tone: "primary",
        },
      ];
    }

    return [
      {
        title: "My Projects",
        value: cardData.myProjects || 0,
        subtitle: "Assigned projects",
        trend: "Developer access",
        icon: FolderKanban,
        tone: "blue",
      },
      {
        title: "My Tasks",
        value: cardData.myTasks || 0,
        subtitle: "All assigned tasks",
        trend: "Workload",
        icon: ListTodo,
        tone: "primary",
      },
      {
        title: "Completed",
        value: cardData.completedTasks || 0,
        subtitle: "Tasks marked done",
        trend: "Good progress",
        icon: CheckCircle2,
        tone: "green",
      },
      {
        title: "Pending",
        value: cardData.pendingTasks || 0,
        subtitle: "Tasks still pending",
        trend: "Need action",
        icon: RefreshCcw,
        tone: "amber",
      },
      {
        title: "Overdue",
        value: cardData.overdueTasks || 0,
        subtitle: "Past due date",
        trend: "Priority",
        icon: AlertCircle,
        tone: "red",
      },
    ];
  }, [dashboard, analytics, isAdminView]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="theme-card p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-primary" size={34} />
          <p className="mt-4 text-lg font-black text-foreground">
            Checking login...
          </p>
          <p className="mt-2 text-sm text-muted">Please wait</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />
            <h2 className="mt-4 text-xl font-black">Loading Dashboard</h2>
            <p className="mt-2 text-sm text-muted">
              Fetching latest CRM analytics...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-xl font-black">Dashboard Error</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

            <button onClick={fetchDashboard} className="theme-btn mt-5">
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-8">
        <section className="relative overflow-hidden rounded-4xl bg-primary px-5 py-7 text-white shadow-2xl shadow-purple-200 sm:rounded-4xl sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                Infriva CRM
              </p>

              <h2 className="mt-3 max-w-2xl text-2xl font-black leading-tight sm:text-4xl">
                {isAdminView
                  ? "Manage leads, clients, quotations, projects and team work."
                  : "Track your assigned projects, tasks and deadlines."}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {isAdminView
                  ? "Your CRM is connected with real backend analytics, recent leads and upcoming tasks."
                  : "Developer view shows only your assigned work and important deadlines."}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
              {isAdminView && (
                <Link
                  href="/leads/new"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:rounded-full"
                >
                  Add New Lead
                  <ArrowRight size={18} />
                </Link>
              )}

              <Link
                href={isAdminView ? "/quotations/new" : "/tasks"}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:rounded-full"
              >
                {isAdminView ? "Create Quotation" : "View Tasks"}
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-5">
          {cards.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </section>

        {isAdminView ? (
          <>
            <section className="grid gap-5 lg:gap-6 xl:grid-cols-[1.5fr_1fr]">
              <LeadTable leads={dashboard?.recentLeads || []} />
              <UpcomingTasks tasks={dashboard?.upcomingTasks || []} />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <AnalyticsBars
                title="Lead Sources"
                data={analytics?.sourceStats || []}
              />

              <AnalyticsBars
                title="Lead Status"
                data={analytics?.statusStats || []}
              />
            </section>
          </>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="theme-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black">Recent Tasks</h3>
                  <p className="mt-1 text-sm text-muted">
                    Your latest assigned work
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <TrendingUp size={21} />
                </div>
              </div>

              {(dashboard?.recentTasks || []).length === 0 ? (
                <EmptyState
                  title="No recent tasks"
                  desc="Assigned tasks will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {(dashboard?.recentTasks || []).map((task) => (
                    <div
                      key={task._id}
                      className="rounded-2xl border border-border bg-surface-alt p-4"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                          <ListTodo size={18} />
                        </div>

                        <div>
                          <p className="font-black text-foreground">
                            {task?.title || task?.taskName || "Untitled Task"}
                          </p>

                          <p className="mt-1 text-sm text-muted">
                            {task?.project?.projectName || "No project"}
                          </p>

                          <span className="mt-2 inline-flex rounded-full bg-primary-light px-3 py-1 text-xs font-black text-primary">
                            {task?.status || "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <UpcomingTasks tasks={dashboard?.upcomingTasks || []} />
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
