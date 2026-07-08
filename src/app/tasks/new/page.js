"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  FileText,
  FolderKanban,
  ListTodo,
  Loader2,
  Save,
  ShieldCheck,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

const statusOptions = ["Todo", "In Progress", "Review", "Done"];
const priorityOptions = ["Low", "Medium", "High"];

const getProjectName = (project) =>
  project?.projectName || project?.name || "Untitled Project";

const getClientName = (project) =>
  project?.client?.clientName ||
  project?.client?.name ||
  project?.clientName ||
  "No client";

function Field({ label, required, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-black text-foreground">
        {Icon && <Icon size={15} className="text-primary" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {children}
    </div>
  );
}

function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-foreground sm:text-xl">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{desc}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Icon size={22} />
        </div>
      </div>

      {children}
    </section>
  );
}

function SelectedProjectCard({ project }) {
  if (!project) return null;

  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-lg shadow-purple-100">
          <FolderKanban size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            Selected Project
          </p>

          <h2 className="mt-1 truncate text-lg font-black text-foreground sm:text-xl">
            {getProjectName(project)}
          </h2>

          <p className="mt-1 truncate text-sm font-semibold text-muted">
            {getClientName(project)}
          </p>
        </div>
      </div>
    </section>
  );
}

function TaskPreviewCard({ form, selectedProject, selectedMember }) {
  return (
    <div className="theme-card p-4 sm:p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
        <ListTodo size={24} />
      </div>

      <h2 className="text-lg font-black sm:text-xl">Task Preview</h2>

      <div className="mt-4 rounded-3xl bg-surface-alt p-4">
        <p className="text-sm font-black text-primary">
          {form.title || "Task title not added"}
        </p>

        <p className="mt-2 text-sm leading-7 text-muted">
          {selectedProject
            ? getProjectName(selectedProject)
            : "Project not selected yet"}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
            {form.status}
          </span>

          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
            {form.priority}
          </span>

          {selectedMember && (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
              {selectedMember.name}
            </span>
          )}

          {form.dueDate && (
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
              Deadline set
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTaskPageContent() {
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

  const selectedMember = useMemo(() => {
    return members.find((member) => member._id === form.assignedTo);
  }, [members, form.assignedTo]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const backHref = selectedProjectFromUrl
    ? `/projects/${selectedProjectFromUrl}`
    : "/tasks";

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
        description: form.description.trim(),
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
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
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
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6"
      >
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                New Task
              </p>

              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                Create Task
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Add project tasks, assign work to team members and track
                delivery deadlines.
              </p>
            </div>

            <Link
              href={backHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:w-fit sm:rounded-full"
            >
              <ArrowLeft size={18} />
              Back
            </Link>
          </div>
        </section>

        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:gap-6">
          <div className="space-y-5 sm:space-y-6">
            <FormSection
              title="Task Information"
              desc="Add task title, project and assignment details."
              icon={ListTodo}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Task Title" required icon={ListTodo}>
                  <div className="relative">
                    <ListTodo
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      className="theme-input pl-11"
                      placeholder="Create homepage design"
                    />
                  </div>
                </Field>

                <Field label="Project" required icon={FolderKanban}>
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
                </Field>

                <Field label="Assign To" icon={UserCog}>
                  <div className="relative">
                    <UserCog
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <select
                      value={form.assignedTo}
                      onChange={(e) =>
                        updateField("assignedTo", e.target.value)
                      }
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
                </Field>

                <Field label="Due Date" icon={CalendarClock}>
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
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Task Status"
              desc="Set task stage and priority before assigning work."
              icon={ShieldCheck}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Status" icon={ShieldCheck}>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="theme-input"
                  >
                    {statusOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Priority" icon={CheckCircle2}>
                  <select
                    value={form.priority}
                    onChange={(e) => updateField("priority", e.target.value)}
                    className="theme-input"
                  >
                    {priorityOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Task Notes"
              desc="Add clear work instructions for the assigned team member."
              icon={FileText}
            >
              <Field label="Description / Notes" icon={FileText}>
                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-muted"
                  />

                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="theme-input min-h-36 resize-none pl-11"
                    placeholder="Task details, design notes, development instructions..."
                  />
                </div>
              </Field>
            </FormSection>

            <div className="hidden flex-col-reverse gap-3 sm:flex sm:flex-row sm:justify-end">
              <Link href={backHref} className="theme-btn-outline">
                Cancel
              </Link>

              <button
                type="submit"
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
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            <SelectedProjectCard project={selectedProject} />

            <TaskPreviewCard
              form={form}
              selectedProject={selectedProject}
              selectedMember={selectedMember}
            />

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">Task Reminder</p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Add a clear title, due date and assignee so team workload and
                project progress stay accurate.
              </p>
            </div>
          </aside>
        </section>

        <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={backHref}
              className="theme-btn-outline rounded-2xl text-xs"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="theme-btn rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  );
}

export default function NewTaskPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
              <Loader2 className="animate-spin text-primary" size={36} />

              <h2 className="mt-4 text-xl font-black">Loading Task Page</h2>

              <p className="mt-2 text-sm text-muted">Please wait...</p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <NewTaskPageContent />
    </Suspense>
  );
}
