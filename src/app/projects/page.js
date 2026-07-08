"use client";
import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
const statusOptions = [
  "All",
  "Not Started",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];
const getProjectName = (project) => project?.projectName || "Untitled Project";
const getClientName = (project) =>
  project?.client?.clientName ||
  project?.client?.name ||
  project?.clientName ||
  "No client";
const getAssignedName = (project) =>
  project?.assignedTo?.name || project?.assignedTo?.email || "";
const getStatusClass = (status = "") => {
  if (status === "Completed") return "bg-green-50 text-green-700";
  if (status === "Cancelled") return "bg-red-50 text-red-700";
  if (status === "On Hold") return "bg-amber-50 text-amber-700";
  if (status === "In Progress") return "bg-blue-50 text-blue-700";
  return "bg-primary-light text-primary";
};
const getProgress = (status = "") => {
  if (status === "Completed") return 100;
  if (status === "In Progress") return 60;
  if (status === "On Hold") return 35;
  if (status === "Cancelled") return 0;
  return 12;
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
const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  if (!amount) return null;
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};
function StatCard({ title, value, desc, icon: Icon, tone = "primary" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-700 shadow-green-100"
      : tone === "blue"
        ? "bg-blue-50 text-blue-700 shadow-blue-100"
        : tone === "amber"
          ? "bg-amber-50 text-amber-700 shadow-amber-100"
          : "bg-primary-light text-primary shadow-purple-100";
  return (
    <div className="group relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100 sm:rounded-3xl sm:p-5">
      {" "}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />{" "}
      <div className="relative flex items-start justify-between gap-3">
        {" "}
        <div className="min-w-0">
          {" "}
          <p className="truncate text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {" "}
            {title}{" "}
          </p>{" "}
          <h3 className="mt-2 truncate text-2xl font-black leading-none text-foreground sm:text-3xl">
            {" "}
            {value}{" "}
          </h3>{" "}
          <p className="mt-3 truncate text-[10px] font-bold text-muted sm:text-sm">
            {" "}
            {desc}{" "}
          </p>{" "}
        </div>{" "}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg sm:h-12 sm:w-12 ${toneClass}`}
        >
          {" "}
          <Icon size={21} />{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
function ProjectCard({ project }) {
  const projectId = project?._id || project?.id;
  const status = project?.status || "Not Started";
  const progress = getProgress(status);
  const budget = formatBudget(project?.budget);
  return (
    <Link
      href={`/projects/${projectId}`}
      className="group relative block overflow-hidden rounded-[1.7rem] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-purple-100 sm:rounded-3xl"
    >
      {" "}
      <div className="relative overflow-hidden bg-primary-light p-3 sm:p-4">
        {" "}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />{" "}
        <div className="absolute -bottom-12 left-8 h-20 w-20 rounded-full bg-white/60 blur-2xl" />{" "}
        <div className="relative flex items-start justify-between gap-2">
          {" "}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {" "}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-purple-100 sm:h-12 sm:w-12">
              {" "}
              <FolderKanban size={19} />{" "}
            </div>{" "}
            <div className="min-w-0">
              {" "}
              <h3 className="truncate text-xs font-black text-foreground sm:text-base">
                {" "}
                {getProjectName(project)}{" "}
              </h3>{" "}
              <p className="mt-1 truncate text-[10px] font-black text-primary sm:text-xs">
                {" "}
                {project?.service || "Service not added"}{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getStatusClass(status)}`}
          >
            {" "}
            {status}{" "}
          </span>{" "}
        </div>{" "}
      </div>{" "}
      <div className="p-3 sm:p-4">
        {" "}
        <div className="space-y-2 rounded-2xl bg-surface-alt p-3">
          {" "}
          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
            {" "}
            <User size={13} className="shrink-0 text-primary" />{" "}
            <span className="truncate">{getClientName(project)}</span>{" "}
          </p>{" "}
          {project?.deadline && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              {" "}
              <CalendarClock size={13} className="shrink-0 text-primary" />{" "}
              <span className="truncate">
                {" "}
                Deadline {formatDate(project.deadline)}{" "}
              </span>{" "}
            </p>
          )}{" "}
          {budget && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              {" "}
              <IndianRupee size={13} className="shrink-0 text-primary" />{" "}
              <span className="truncate">{budget}</span>{" "}
            </p>
          )}{" "}
        </div>{" "}
        <div className="mt-4">
          {" "}
          <div className="mb-2 flex items-center justify-between text-[10px] font-black text-muted sm:text-xs">
            {" "}
            <span>Progress</span> <span>{progress}%</span>{" "}
          </div>{" "}
          <div className="h-2 overflow-hidden rounded-full bg-primary-light">
            {" "}
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />{" "}
          </div>{" "}
        </div>{" "}
        {project?.notes && (
          <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-muted sm:text-sm sm:leading-6">
            {" "}
            {project.notes}{" "}
          </p>
        )}{" "}
        <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {" "}
          {getAssignedName(project) && (
            <span className="rounded-full bg-primary-light px-2 py-1 text-[9px] font-black text-primary sm:px-3 sm:text-[11px]">
              {" "}
              {getAssignedName(project)}{" "}
            </span>
          )}{" "}
          <span className="rounded-full bg-surface-alt px-2 py-1 text-[9px] font-black text-foreground sm:px-3 sm:text-[11px]">
            {" "}
            {formatDate(project?.createdAt)}{" "}
          </span>{" "}
        </div>{" "}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] font-black text-primary sm:text-xs">
          {" "}
          <span>View Project</span>{" "}
          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />{" "}
        </div>{" "}
      </div>{" "}
    </Link>
  );
}
export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiFetch("/projects");
      setProjects(res?.projects || res?.data || []);
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
      setError(err?.message || "Failed to fetch projects");
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
    fetchProjects();
  }, [router]);
  const filteredProjects = useMemo(() => {
    const value = search.toLowerCase();
    return projects.filter((project) => {
      const matchesSearch =
        getProjectName(project).toLowerCase().includes(value) ||
        getClientName(project).toLowerCase().includes(value) ||
        project?.service?.toLowerCase().includes(value) ||
        project?.notes?.toLowerCase().includes(value);
      const matchesStatus = status === "All" || project?.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((sum, project) => {
      return sum + Number(project?.budget || 0);
    }, 0);
    return {
      total: projects.length,
      progress: projects.filter((project) => project?.status === "In Progress")
        .length,
      completed: projects.filter((project) => project?.status === "Completed")
        .length,
      budget: totalBudget
        ? totalBudget.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          })
        : "₹0",
    };
  }, [projects]);
  const statCards = [
    {
      title: "Total Projects",
      value: stats.total,
      desc: "All projects",
      icon: FolderKanban,
      tone: "primary",
    },
    {
      title: "In Progress",
      value: stats.progress,
      desc: "Active delivery",
      icon: Clock,
      tone: "blue",
    },
    {
      title: "Completed",
      value: stats.completed,
      desc: "Finished work",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Total Value",
      value: stats.budget,
      desc: "Project budget",
      icon: IndianRupee,
      tone: "amber",
    },
  ];
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-5 sm:space-y-6">
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
                Project Management{" "}
              </p>{" "}
              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                {" "}
                Projects{" "}
              </h1>{" "}
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {" "}
                Track website, CRM, SEO, automation and client delivery projects
                in one place.{" "}
              </p>{" "}
            </div>{" "}
            <Link
              href="/projects/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
            >
              {" "}
              <Plus size={18} /> New Project{" "}
            </Link>{" "}
          </div>{" "}
        </section>{" "}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {" "}
          {statCards.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}{" "}
        </section>{" "}
        <section className="theme-card p-4 sm:p-5">
          {" "}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-[1.5fr_0.7fr]">
            {" "}
            <div className="relative col-span-2 lg:col-span-1">
              {" "}
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />{" "}
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search project, client, service..."
                className="theme-input pl-11"
              />{" "}
            </div>{" "}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="theme-input col-span-2 text-sm lg:col-span-1"
            >
              {" "}
              {statusOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-muted sm:text-sm">
            {" "}
            <SlidersHorizontal size={16} /> Showing {filteredProjects.length} of{" "}
            {projects.length} projects{" "}
          </div>{" "}
        </section>{" "}
        {loading ? (
          <div className="theme-card flex min-h-90 items-center justify-center p-8">
            {" "}
            <div className="text-center">
              {" "}
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />{" "}
              <h2 className="mt-4 text-xl font-black">Loading projects</h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                Fetching latest project data...{" "}
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
              <h2 className="mt-4 text-xl font-black">Error</h2>{" "}
              <p className="mt-2 text-sm text-muted">{error}</p>{" "}
              <button onClick={fetchProjects} className="theme-btn mt-5">
                {" "}
                Try Again{" "}
              </button>{" "}
            </div>{" "}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            {" "}
            <div>
              {" "}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                {" "}
                <FolderKanban size={26} />{" "}
              </div>{" "}
              <h2 className="mt-4 text-xl font-black">No projects found</h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                Create your first project from a client or manually.{" "}
              </p>{" "}
              <Link href="/projects/new" className="theme-btn mt-5">
                {" "}
                Create Project{" "}
              </Link>{" "}
            </div>{" "}
          </div>
        ) : (
          <section>
            {" "}
            <div className="mb-3 flex items-center justify-between">
              {" "}
              <div>
                {" "}
                <h2 className="text-lg font-black text-foreground">
                  {" "}
                  Project Cards{" "}
                </h2>{" "}
                <p className="text-xs font-semibold text-muted sm:text-sm">
                  {" "}
                  Attractive project delivery grid{" "}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
              {" "}
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project._id || project.id}
                  project={project}
                />
              ))}{" "}
            </div>{" "}
          </section>
        )}{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
