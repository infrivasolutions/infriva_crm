"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCcw,
  Save,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = ["Todo", "In Progress", "Review", "Done"];
const priorityOptions = ["Low", "Medium", "High"];

const getTaskTitle = (task) => task?.title || "Untitled Task";

const getProjectName = (project) => project?.projectName || "Untitled Project";

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) =>
  client?.companyName || client?.company || "No company added";

const getAssignedName = (task) =>
  task?.assignedTo?.name || task?.assignedTo?.email || "Not assigned";

const getStatusClass = (status = "") => {
  if (status === "Done") return "bg-green-50 text-green-700";
  if (status === "Review") return "bg-purple-50 text-purple-700";
  if (status === "In Progress") return "bg-blue-50 text-blue-700";

  return "bg-primary-light text-primary";
};

const getPriorityClass = (priority = "") => {
  if (priority === "High") return "bg-orange-50 text-orange-700";
  if (priority === "Medium") return "bg-amber-50 text-amber-700";
  if (priority === "Low") return "bg-blue-50 text-blue-700";

  return "bg-primary-light text-primary";
};

const getProgress = (status = "") => {
  if (status === "Done") return 100;
  if (status === "Review") return 75;
  if (status === "In Progress") return 55;
  return 10;
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

const toDateInputValue = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
};

const isOverdue = (task) => {
  if (!task?.dueDate || task?.status === "Done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-3xl border border-border bg-surface-alt p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-purple-100 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {label}
          </p>

          <p className="mt-1 wrap-break-word text-xs font-black text-foreground sm:text-sm">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="theme-card p-4 sm:p-6">
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

function HeroAction({ href, icon: Icon, children, variant = "white" }) {
  const classes =
    variant === "white"
      ? "bg-white text-primary hover:bg-primary-light"
      : "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20";

  return (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noreferrer" : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-black transition sm:rounded-full sm:px-5 sm:text-sm ${classes}`}
    >
      <Icon size={17} />
      {children}
    </a>
  );
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.id;

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    status: "Todo",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await apiFetch(`/tasks/${taskId}`);
      const taskData = res?.task || res?.data;

      if (!taskData) {
        throw new Error("Task not found");
      }

      setTask(taskData);

      setForm({
        title: taskData?.title || "",
        status: taskData?.status || "Todo",
        priority: taskData?.priority || "Medium",
        assignedTo: taskData?.assignedTo?._id || "",
        dueDate: toDateInputValue(taskData?.dueDate),
        description: taskData?.description || "",
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

      setError(err?.message || "Failed to load task");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setMembersLoading(true);

      const res = await apiFetch("/users");
      const usersData = res?.users || res?.data || [];

      setMembers(
        usersData.filter((user) =>
          ["admin", "ads-manager", "developer"].includes(user?.role),
        ),
      );
    } catch (err) {
      console.error(err);
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (taskId) {
      fetchTask();
      fetchMembers();
    }
  }, [taskId, router]);

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.title.trim()) {
        throw new Error("Task title is required");
      }

      const payload = {
        title: form.title.trim(),
        status: form.status,
        priority: form.priority,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
        description: form.description.trim(),
      };

      const res = await apiFetch(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const updatedTask = res?.task || res?.data;

      if (updatedTask) {
        setTask(updatedTask);
      } else {
        await fetchTask();
      }

      setSuccess("Task updated successfully");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const whatsappLink = useMemo(() => {
    const phone = String(task?.project?.client?.phone || "").replace(/\D/g, "");

    if (!phone) return "#";

    const message = encodeURIComponent(
      `Hello ${getClientName(
        task?.project?.client,
      )}, this is Infriva Solutions. Sharing an update regarding task: ${getTaskTitle(
        task,
      )}.`,
    );

    return `https://wa.me/91${phone.slice(-10)}?text=${message}`;
  }, [task]);

  const overdue = isOverdue(task);
  const progress = getProgress(task?.status);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />

            <h2 className="mt-4 text-xl font-black">Loading Task</h2>

            <p className="mt-2 text-sm text-muted">
              Fetching complete task details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !task) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="theme-card w-full max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-xl font-black">Task Error</h2>

            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

            <div className="mt-5 flex justify-center gap-3">
              <Link href="/tasks" className="theme-btn-outline">
                Back
              </Link>

              <button type="button" onClick={fetchTask} className="theme-btn">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 sm:space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div className="min-w-0">
              <Link
                href="/tasks"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
              >
                <ArrowLeft size={17} />
                Back to Tasks
              </Link>

              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                Task Detail
              </p>

              <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                {getTaskTitle(task)}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Task for project: {getProjectName(task?.project)}.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getStatusClass(
                    task?.status,
                  )}`}
                >
                  {task?.status || "Todo"}
                </span>

                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getPriorityClass(
                    task?.priority,
                  )}`}
                >
                  {task?.priority || "Medium"} Priority
                </span>

                {overdue && (
                  <span className="rounded-full bg-red-50 px-3 py-2 text-[11px] font-black text-red-700 sm:px-4 sm:text-xs">
                    Overdue
                  </span>
                )}

                <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                  Created {formatDate(task?.createdAt)}
                </span>
              </div>

              <div className="mt-5 max-w-md">
                <div className="mb-2 flex items-center justify-between text-xs font-black text-white/70">
                  <span>Task Progress</span>
                  <span>{progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:justify-end">
              {task?.project?._id && (
                <Link
                  href={`/projects/${task.project._id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-black text-primary transition hover:bg-primary-light sm:rounded-full sm:px-5 sm:text-sm"
                >
                  <FolderKanban size={17} />
                  Project
                </Link>
              )}

              {task?.project?.client?.phone && (
                <HeroAction
                  href={whatsappLink}
                  icon={MessageCircle}
                  variant="glass"
                >
                  WhatsApp
                </HeroAction>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {success}
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
          <div className="space-y-5 sm:space-y-6">
            <FormSection
              title="Task Information"
              desc="Delivery task and assignment details."
              icon={ListTodo}
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                <DetailItem
                  icon={ListTodo}
                  label="Task Title"
                  value={task?.title}
                />

                <DetailItem
                  icon={CheckCircle2}
                  label="Status"
                  value={task?.status}
                />

                <DetailItem
                  icon={Clock}
                  label="Priority"
                  value={task?.priority}
                />

                <DetailItem
                  icon={CalendarClock}
                  label="Due Date"
                  value={formatDate(task?.dueDate)}
                />

                <DetailItem
                  icon={UserCog}
                  label="Assigned To"
                  value={getAssignedName(task)}
                />

                <DetailItem
                  icon={CalendarClock}
                  label="Created At"
                  value={formatDate(task?.createdAt)}
                />
              </div>

              {task?.description && (
                <div className="mt-4 rounded-3xl border border-border bg-surface-alt p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-muted">
                    Description
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {task.description}
                  </p>
                </div>
              )}
            </FormSection>

            <FormSection
              title="Project Information"
              desc="Task connected project and client."
              icon={FolderKanban}
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                <DetailItem
                  icon={FolderKanban}
                  label="Project"
                  value={getProjectName(task?.project)}
                />

                <DetailItem
                  icon={CheckCircle2}
                  label="Project Status"
                  value={task?.project?.status}
                />

                <DetailItem
                  icon={User}
                  label="Client"
                  value={getClientName(task?.project?.client)}
                />

                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={getCompanyName(task?.project?.client)}
                />

                <DetailItem
                  icon={Phone}
                  label="Client Phone"
                  value={task?.project?.client?.phone}
                />

                <DetailItem
                  icon={Mail}
                  label="Client Email"
                  value={task?.project?.client?.email}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
                {task?.project?._id && (
                  <Link
                    href={`/projects/${task.project._id}`}
                    className="theme-btn-outline w-full sm:w-fit"
                  >
                    View Project
                  </Link>
                )}

                {task?.project?.client?._id && (
                  <Link
                    href={`/clients/${task.project.client._id}`}
                    className="theme-btn-outline w-full sm:w-fit"
                  >
                    View Client
                  </Link>
                )}
              </div>
            </FormSection>
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black sm:text-xl">Update Task</h2>

                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Change title, status, priority, assignee and due date.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-black">
                    Task Title
                  </label>

                  <input
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    className="theme-input"
                    placeholder="Task title"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <label className="mb-2 block text-sm font-black">
                      Status
                    </label>

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
                    <label className="mb-2 block text-sm font-black">
                      Priority
                    </label>

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
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Assign To
                  </label>

                  <select
                    value={form.assignedTo}
                    onChange={(e) => updateField("assignedTo", e.target.value)}
                    className="theme-input"
                    disabled={membersLoading}
                  >
                    <option value="">Not Assigned</option>

                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} - {member.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                    className="theme-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="theme-input min-h-32 resize-none"
                    placeholder="Task notes or instructions..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="theme-btn hidden w-full disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-black sm:text-xl">Quick Actions</h2>

                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Move task to common stages quickly.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => updateField("status", "In Progress")}
                  className="theme-btn-outline w-full"
                >
                  Mark In Progress
                </button>

                <button
                  type="button"
                  onClick={() => updateField("status", "Review")}
                  className="theme-btn-outline w-full"
                >
                  Move To Review
                </button>

                <button
                  type="button"
                  onClick={() => updateField("status", "Done")}
                  className="theme-btn w-full"
                >
                  <CheckCircle2 size={18} />
                  Mark Done
                </button>

                <button
                  type="button"
                  onClick={fetchTask}
                  className="theme-btn-outline w-full"
                >
                  <RefreshCcw size={18} />
                  Refresh Task
                </button>
              </div>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">Task Reminder</p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Keep task status updated daily so dashboard and team workload
                remain accurate.
              </p>
            </div>
          </aside>
        </section>

        <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="theme-btn w-full rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
