"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = [
  "All",
  "Todo",
  "In Progress",
  "Review",
  "Done",
  "Blocked",
];

const priorityOptions = ["All", "Low", "Medium", "High", "Urgent"];

const getTaskTitle = (task) =>
  task?.title || task?.taskName || task?.name || "Untitled Task";

const getProjectName = (task) =>
  task?.project?.projectName ||
  task?.project?.name ||
  task?.projectName ||
  "No project";

const getAssigneeName = (task) =>
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

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isOverdue = (task) => {
  if (!task?.dueDate || task?.status === "Done") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(task.dueDate);
  due.setHours(0, 0, 0, 0);

  return due < today;
};

export default function TasksPage() {
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/tasks");
      setTasks(res?.tasks || res?.data || []);
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

      setError(err?.message || "Failed to fetch tasks");
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

    fetchTasks();
  }, [router]);

  const filteredTasks = useMemo(() => {
    const value = search.toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        getTaskTitle(task).toLowerCase().includes(value) ||
        getProjectName(task).toLowerCase().includes(value) ||
        getAssigneeName(task).toLowerCase().includes(value) ||
        task?.description?.toLowerCase().includes(value) ||
        task?.notes?.toLowerCase().includes(value);

      const matchesStatus = status === "All" || task?.status === status;
      const matchesPriority = priority === "All" || task?.priority === priority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, status, priority]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              Task Management
            </p>

            <h1 className="mt-2 text-3xl font-black">Tasks</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Track project tasks, due dates, team workload and delivery
              progress.
            </p>
          </div>

          <Link
            href="/tasks/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
          >
            <Plus size={18} />
            New Task
          </Link>
        </section>

        <section className="theme-card p-4">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by task, project, assignee..."
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

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="theme-input"
            >
              {priorityOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
            <SlidersHorizontal size={16} />
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </section>

        {loading ? (
          <div className="theme-card flex min-h-[360px] items-center justify-center p-8">
            <div className="text-center">
              <Loader2
                className="mx-auto animate-spin text-primary"
                size={36}
              />
              <h2 className="mt-4 text-xl font-black">Loading tasks</h2>
              <p className="mt-2 text-sm text-muted">
                Fetching latest task data...
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

              <button onClick={fetchTasks} className="theme-btn mt-5">
                Try Again
              </button>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="theme-card flex min-h-[320px] items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <ListTodo size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">No tasks found</h2>
              <p className="mt-2 text-sm text-muted">
                Create your first task from a project or manually.
              </p>

              <Link href="/tasks/new" className="theme-btn mt-5">
                Create Task
              </Link>
            </div>
          </div>
        ) : (
          <section className="grid gap-4">
            {filteredTasks.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-foreground">
                        {getTaskTitle(task)}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                          task?.status,
                        )}`}
                      >
                        {task?.status || "Todo"}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getPriorityClass(
                          task?.priority,
                        )}`}
                      >
                        {task?.priority || "Medium"}
                      </span>

                      {isOverdue(task) && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          Overdue
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-bold text-primary">
                      {getProjectName(task)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                      <span className="inline-flex items-center gap-2">
                        <UserCog size={15} />
                        {getAssigneeName(task)}
                      </span>

                      {task?.dueDate && (
                        <span className="inline-flex items-center gap-2">
                          <CalendarClock size={15} />
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-2">
                        <Clock size={15} />
                        Created {formatDate(task.createdAt)}
                      </span>
                    </div>

                    {(task?.description || task?.notes) && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                        {task.description || task.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {task?.status === "Done" ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
                        <CheckCircle2 size={14} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                        Pending Work
                      </span>
                    )}

                    <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                      Project Task
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
