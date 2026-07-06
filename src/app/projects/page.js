"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  CalendarClock,
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

const getStatusClass = (status = "") => {
  if (status === "Completed") return "bg-green-50 text-green-700";
  if (status === "Cancelled") return "bg-red-50 text-red-700";
  if (status === "On Hold") return "bg-amber-50 text-amber-700";
  if (status === "In Progress") return "bg-blue-50 text-blue-700";

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

const formatBudget = (budget) => {
  const amount = Number(budget || 0);

  if (!amount) return null;

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              Project Management
            </p>

            <h1 className="mt-2 text-3xl font-black">Projects</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Track website, CRM, SEO, automation and client delivery projects
              in one place.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
          >
            <Plus size={18} />
            New Project
          </Link>
        </section>

        <section className="theme-card p-4">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by project, client, service..."
                className="theme-input pl-11"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="theme-input"
            >
              {statusOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
            <SlidersHorizontal size={16} />
            Showing {filteredProjects.length} of {projects.length} projects
          </div>
        </section>

        {loading ? (
          <div className="theme-card flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />
              <h2 className="mt-4 text-xl font-black">Loading projects</h2>
              <p className="mt-2 text-sm text-muted">
                Fetching latest project data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="theme-card flex min-h-[320px] items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">Error</h2>
              <p className="mt-2 text-sm text-muted">{error}</p>

              <button onClick={fetchProjects} className="theme-btn mt-5">
                Try Again
              </button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="theme-card flex min-h-[320px] items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <FolderKanban size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">No projects found</h2>
              <p className="mt-2 text-sm text-muted">
                Create your first project from a client or manually.
              </p>

              <Link href="/projects/new" className="theme-btn mt-5">
                Create Project
              </Link>
            </div>
          </div>
        ) : (
          <section className="grid gap-4">
            {filteredProjects.map((project) => (
              <Link
                key={project._id}
                href={`/projects/${project._id}`}
                className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-foreground">
                        {getProjectName(project)}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                          project?.status,
                        )}`}
                      >
                        {project?.status || "Not Started"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-primary">
                      {project?.service || "Service not added"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-2">
                        <User size={15} />
                        {getClientName(project)}
                      </span>

                      {project?.deadline && (
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock size={15} />
                          Deadline: {formatDate(project.deadline)}
                        </span>
                      )}

                      {Number(project?.budget || 0) > 0 && (
                        <span className="inline-flex items-center gap-2">
                          <IndianRupee size={15} />
                          {formatBudget(project.budget)}
                        </span>
                      )}
                    </div>

                    {project?.notes && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                        {project.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {project?.assignedTo?.name && (
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                        Assigned: {project.assignedTo.name}
                      </span>
                    )}

                    <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                      Created {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
