"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Loader2,
  Mail,
  RefreshCcw,
  SlidersHorizontal,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = ["All", "Todo", "In Progress", "Review", "Done"];
const priorityOptions = ["All", "Low", "Medium", "High"];

const getRoleLabel = (role = "") => {
  if (role === "admin") return "Admin";
  if (role === "ads-manager") return "Ads Manager";
  if (role === "developer") return "Developer";
  return role || "Member";
};

const getRoleClass = (role = "") => {
  if (role === "admin") return "bg-primary-light text-primary";
  if (role === "ads-manager") return "bg-blue-50 text-blue-700";
  if (role === "developer") return "bg-green-50 text-green-700";
  return "bg-white text-primary";
};

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

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-IN", {
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

const getProgress = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};

function StatCard({ title, value, desc, icon: Icon, tone = "primary" }) {
  const toneClass =
    tone === "green"
      ? "bg-green-50 text-green-700 shadow-green-100"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700 shadow-amber-100"
        : tone === "red"
          ? "bg-red-50 text-red-700 shadow-red-100"
          : "bg-primary-light text-primary shadow-purple-100";

  return (
    <div className="group relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-100 sm:rounded-3xl sm:p-5">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition group-hover:bg-primary/10" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-black leading-none text-foreground sm:text-3xl">
            {value}
          </h3>

          <p className="mt-3 truncate text-[10px] font-bold text-muted sm:text-sm">
            {desc}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg sm:h-12 sm:w-12 ${toneClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function TaskCard({ task }) {
  const overdue = isOverdue(task);

  return (
    <Link
      href={`/tasks/${task._id}`}
      className="group relative block overflow-hidden rounded-[1.7rem] border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-2xl hover:shadow-purple-100 sm:rounded-3xl"
    >
      <div className="relative overflow-hidden bg-primary-light p-3 sm:p-4">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-2xl" />
        <div className="absolute -bottom-12 left-8 h-20 w-20 rounded-full bg-white/60 blur-2xl" />

        <div className="relative flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-lg shadow-purple-100 sm:h-12 sm:w-12">
              <ListTodo size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-xs font-black text-foreground sm:text-base">
                {task?.title || "Untitled Task"}
              </h3>

              <p className="mt-1 truncate text-[10px] font-black text-primary sm:text-xs">
                {task?.project?.projectName || "No project"}
              </p>
            </div>
          </div>

          {overdue ? (
            <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-black text-red-700 sm:px-3 sm:text-[11px]">
              Overdue
            </span>
          ) : (
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getStatusClass(
                task?.status,
              )}`}
            >
              {task?.status || "Todo"}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap gap-1.5 sm:gap-2">
          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getStatusClass(
              task?.status,
            )}`}
          >
            {task?.status || "Todo"}
          </span>

          <span
            className={`rounded-full px-2 py-1 text-[9px] font-black sm:px-3 sm:text-[11px] ${getPriorityClass(
              task?.priority,
            )}`}
          >
            {task?.priority || "Medium"}
          </span>
        </div>

        <div className="space-y-2 rounded-2xl bg-surface-alt p-3">
          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
            <FolderKanban size={13} className="shrink-0 text-primary" />
            <span className="truncate">
              {task?.project?.service || "No service"}
            </span>
          </p>

          {task?.dueDate && (
            <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
              <CalendarClock size={13} className="shrink-0 text-primary" />
              <span className="truncate">Due {formatDate(task.dueDate)}</span>
            </p>
          )}

          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-muted sm:gap-2 sm:text-xs">
            <Clock size={13} className="shrink-0 text-primary" />
            <span className="truncate">
              Created {formatDate(task?.createdAt)}
            </span>
          </p>
        </div>

        {task?.description && (
          <p className="mt-4 line-clamp-2 text-[11px] leading-5 text-muted sm:text-sm sm:leading-6">
            {task.description}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] font-black text-primary sm:text-xs">
          <span>View Task</span>

          <ArrowRight
            size={15}
            className="transition group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}

export default function TeamWorkloadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [member, setMember] = useState(null);

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch(`/dashboard/team-workload/${userId}`);

      setMember(res?.data?.user || null);

      setStats(
        res?.data?.stats || {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
        },
      );

      setTasks(res?.data?.tasks || []);
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

      setError(err?.message || "Failed to fetch workload detail");
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

    if (userId) {
      fetchDetail();
    }
  }, [userId, router]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = status === "All" || task?.status === status;
      const matchesPriority = priority === "All" || task?.priority === priority;

      return matchesStatus && matchesPriority;
    });
  }, [tasks, status, priority]);

  const progress = getProgress(stats.completedTasks, stats.totalTasks);

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      desc: "Assigned tasks",
      icon: ListTodo,
      tone: "primary",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      desc: "Finished tasks",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      desc: "Remaining work",
      icon: Clock,
      tone: "amber",
    },
    {
      title: "Overdue",
      value: stats.overdueTasks,
      desc: "Needs attention",
      icon: AlertCircle,
      tone: "red",
    },
  ];

  if (loading) {
    return (
      <RoleGuard allowedRoles={["admin", "ads-manager"]}>
        <DashboardLayout>
          <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
              <Loader2 className="animate-spin text-primary" size={36} />

              <h2 className="mt-4 text-xl font-black">Loading Workload</h2>

              <p className="mt-2 text-sm text-muted">
                Fetching member task details...
              </p>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard allowedRoles={["admin", "ads-manager"]}>
        <DashboardLayout>
          <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertCircle size={26} />
              </div>

              <h2 className="mt-4 text-xl font-black">Workload Error</h2>

              <p className="mt-2 text-sm text-muted">{error}</p>

              <button
                type="button"
                onClick={fetchDetail}
                className="theme-btn mt-5"
              >
                Try Again
              </button>
            </div>
          </div>
        </DashboardLayout>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-5 sm:space-y-6">
          <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div className="min-w-0">
                <Link
                  href="/team-workload"
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
                >
                  <ArrowLeft size={17} />
                  Back to Workload
                </Link>

                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                  Workload Detail
                </p>

                <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                  {member?.name || "Team Member"}
                </h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    <Mail size={14} />
                    <span className="truncate">
                      {member?.email || "No email"}
                    </span>
                  </span>

                  <span
                    className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getRoleClass(
                      member?.role,
                    )}`}
                  >
                    {getRoleLabel(member?.role)}
                  </span>

                  <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    {member?.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchDetail}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light sm:w-fit sm:rounded-full"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </section>

          <section className="theme-card p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between text-xs font-black text-muted sm:text-sm">
              <span>Overall Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-primary-light">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-surface-alt p-3 text-center">
                <p className="text-lg font-black text-foreground">
                  {stats.totalTasks}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-muted">
                  Total
                </p>
              </div>

              <div className="rounded-2xl bg-green-50 p-3 text-center">
                <p className="text-lg font-black text-green-700">
                  {stats.completedTasks}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                  Done
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <p className="text-lg font-black text-amber-700">
                  {stats.pendingTasks}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Pending
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 p-3 text-center">
                <p className="text-lg font-black text-red-700">
                  {stats.overdueTasks}
                </p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-wider text-red-700">
                  Overdue
                </p>
              </div>
            </div>
          </section>

          <section className="theme-card p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="theme-input text-sm"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Status" : item}
                  </option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="theme-input text-sm"
              >
                {priorityOptions.map((item) => (
                  <option key={item} value={item}>
                    {item === "All" ? "All Priority" : item}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted sm:text-sm">
              <SlidersHorizontal size={16} />
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </section>

          {filteredTasks.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <ListTodo size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">No tasks found</h2>

                <p className="mt-2 text-sm text-muted">
                  Assigned tasks will appear here.
                </p>
              </div>
            </div>
          ) : (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">
                    Assigned Tasks
                  </h2>

                  <p className="text-xs font-semibold text-muted sm:text-sm">
                    Mobile friendly task cards
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </div>
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
