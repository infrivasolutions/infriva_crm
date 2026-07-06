"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  FileText,
  FolderKanban,
  ListTodo,
  Loader2,
  Save,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = ["Todo", "In Progress", "Review", "Done"];

const priorityOptions = ["Low", "Medium", "High"];

const getProjectName = (project) =>
  project?.projectName || project?.name || "Untitled Project";

const getClientName = (project) =>
  project?.client?.clientName ||
  project?.client?.name ||
  project?.clientName ||
  "No client";

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedProjectFromUrl = searchParams.get("project") || "";

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    project: "",
    assignedTo: "",
    status: "Todo",
    priority: "Medium",
    dueDate: "",
    description: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const projectsRes = await apiFetch("/projects");
      const projectsData = projectsRes?.projects || projectsRes?.data || [];

      setProjects(projectsData);

      setForm((prev) => ({
        ...prev,
        project: selectedProjectFromUrl,
      }));

      try {
        const usersRes = await apiFetch("/users");
        const usersData = usersRes?.users || usersRes?.data || [];

        setMembers(
          usersData.filter((user) =>
            ["admin", "ads-manager", "developer"].includes(user?.role),
          ),
        );
      } catch {
        setMembers([]);
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

      setError(err?.message || "Failed to load task form");
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
  }, [router, selectedProjectFromUrl]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project._id === form.project);
  }, [projects, form.project]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.title.trim()) {
        throw new Error("Task title is required");
      }

      if (!form.project) {
        throw new Error("Please select a project");
      }

      const payload = {
        title: form.title.trim(),
        project: form.project,
        assignedTo: form.assignedTo || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        description: form.description,
      };

      const res = await apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const taskId = res?.task?._id || res?.data?._id;

      if (taskId) {
        router.push(`/tasks/${taskId}`);
      } else if (form.project) {
        router.push(`/projects/${form.project}`);
      } else {
        router.push("/tasks");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create task");
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
            <h2 className="mt-4 text-xl font-black">Loading Task Form</h2>
            <p className="mt-2 text-sm text-muted">
              Fetching projects and team members...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              New Task
            </p>

            <h1 className="mt-2 text-3xl font-black">Create Task</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Add project tasks, assign work to team members and track delivery
              deadlines.
            </p>
          </div>

          <Link
            href={
              selectedProjectFromUrl
                ? `/projects/${selectedProjectFromUrl}`
                : "/tasks"
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back
          </Link>
        </section>

        {selectedProject && (
          <section className="theme-card-soft p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <FolderKanban size={22} />
              </div>

              <div>
                <p className="text-sm font-black text-primary">
                  Selected Project
                </p>

                <h2 className="mt-1 text-xl font-black text-foreground">
                  {getProjectName(selectedProject)}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {getClientName(selectedProject)}
                </p>
              </div>
            </div>
          </section>
        )}

        <form onSubmit={handleSubmit} className="theme-card p-5 sm:p-6">
          {error && (
            <div className="mb-5 flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-black text-foreground">
              Task Information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Fill task details, priority, deadline and assignee.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black">
                Task Title <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <ListTodo
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="theme-input pl-11"
                  placeholder="Example: Create homepage design"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Project <span className="text-red-500">*</span>
              </label>

              <select
                value={form.project}
                onChange={(e) => updateField("project", e.target.value)}
                className="theme-input"
              >
                <option value="">Select Project</option>

                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {getProjectName(project)} - {getClientName(project)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Assign To</label>

              <div className="relative">
                <UserCog
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <select
                  value={form.assignedTo}
                  onChange={(e) => updateField("assignedTo", e.target.value)}
                  className="theme-input pl-11"
                >
                  <option value="">Not Assigned</option>

                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
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

            <div>
              <label className="mb-2 block text-sm font-black">Priority</label>

              <select
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                className="theme-input"
              >
                {priorityOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Due Date</label>

              <div className="relative">
                <CalendarClock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => updateField("dueDate", e.target.value)}
                  className="theme-input pl-11"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black">
                Description / Notes
              </label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-4 text-muted"
                />

                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="theme-input min-h-32 resize-none pl-11"
                  placeholder="Task details, design notes, development instructions..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={
                selectedProjectFromUrl
                  ? `/projects/${selectedProjectFromUrl}`
                  : "/tasks"
              }
              className="theme-btn-outline"
            >
              Cancel
            </Link>

            <button
              disabled={saving}
              className="theme-btn disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
