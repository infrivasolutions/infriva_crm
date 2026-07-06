"use client";
import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListTodo,
  Loader2,
  Mail,
  RefreshCcw,
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
const getProgress = (completed, total) => {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
};
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
  if (loading) {
    return (
      <DashboardLayout>
        {" "}
        <div className="flex min-h-[70vh] items-center justify-center">
          {" "}
          <div className="theme-card flex flex-col items-center p-8 text-center">
            {" "}
            <Loader2 className="animate-spin text-primary" size={36} />{" "}
            <h2 className="mt-4 text-xl font-black">Loading Workload</h2>{" "}
            <p className="mt-2 text-sm text-muted">
              {" "}
              Fetching member task details...{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  if (error) {
    return (
      <DashboardLayout>
        {" "}
        <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
          {" "}
          <div>
            {" "}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {" "}
              <AlertCircle size={26} />{" "}
            </div>{" "}
            <h2 className="mt-4 text-xl font-black">Workload Error</h2>{" "}
            <p className="mt-2 text-sm text-muted">{error}</p>{" "}
            <button onClick={fetchDetail} className="theme-btn mt-5">
              {" "}
              Try Again{" "}
            </button>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-6">
        {" "}
        <section className="relative overflow-hidden rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200">
          {" "}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            {" "}
            <div>
              {" "}
              <Link
                href="/team-workload"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                {" "}
                <ArrowLeft size={17} /> Back to Workload{" "}
              </Link>{" "}
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                {" "}
                Workload Detail{" "}
              </p>{" "}
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {" "}
                {member?.name || "Team Member"}{" "}
              </h1>{" "}
              <p className="mt-3 flex flex-wrap items-center gap-3 text-sm leading-7 text-white/75">
                {" "}
                <span className="inline-flex items-center gap-2">
                  {" "}
                  <Mail size={16} /> {member?.email || "No email"}{" "}
                </span>{" "}
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                  {" "}
                  {getRoleLabel(member?.role)}{" "}
                </span>{" "}
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black text-white">
                  {" "}
                  {member?.isActive !== false ? "Active" : "Inactive"}{" "}
                </span>{" "}
              </p>{" "}
            </div>{" "}
            <button
              onClick={fetchDetail}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              {" "}
              <RefreshCcw size={18} /> Refresh{" "}
            </button>{" "}
          </div>{" "}
        </section>{" "}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {" "}
          <div className="theme-card-soft p-5">
            {" "}
            <p className="text-sm font-bold text-muted">Total Tasks</p>{" "}
            <h3 className="mt-2 text-3xl font-black">
              {stats.totalTasks}
            </h3>{" "}
          </div>{" "}
          <div className="theme-card-soft p-5">
            {" "}
            <p className="text-sm font-bold text-muted">Completed</p>{" "}
            <h3 className="mt-2 text-3xl font-black text-green-700">
              {" "}
              {stats.completedTasks}{" "}
            </h3>{" "}
          </div>{" "}
          <div className="theme-card-soft p-5">
            {" "}
            <p className="text-sm font-bold text-muted">Pending</p>{" "}
            <h3 className="mt-2 text-3xl font-black text-amber-700">
              {" "}
              {stats.pendingTasks}{" "}
            </h3>{" "}
          </div>{" "}
          <div className="theme-card-soft p-5">
            {" "}
            <p className="text-sm font-bold text-muted">Overdue</p>{" "}
            <h3 className="mt-2 text-3xl font-black text-red-700">
              {" "}
              {stats.overdueTasks}{" "}
            </h3>{" "}
          </div>{" "}
        </section>{" "}
        <section className="theme-card p-5">
          {" "}
          <div className="mb-2 flex items-center justify-between text-sm">
            {" "}
            <span className="font-bold text-muted">Overall Progress</span>{" "}
            <span className="font-black text-primary">{progress}%</span>{" "}
          </div>{" "}
          <div className="h-3 overflow-hidden rounded-full bg-primary-light">
            {" "}
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />{" "}
          </div>{" "}
        </section>{" "}
        <section className="theme-card p-4">
          {" "}
          <div className="grid gap-3 md:grid-cols-2">
            {" "}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="theme-input"
            >
              {" "}
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {" "}
                  {item === "All" ? "All Status" : item}{" "}
                </option>
              ))}{" "}
            </select>{" "}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="theme-input"
            >
              {" "}
              {priorityOptions.map((item) => (
                <option key={item} value={item}>
                  {" "}
                  {item === "All" ? "All Priority" : item}{" "}
                </option>
              ))}{" "}
            </select>{" "}
          </div>{" "}
          <p className="mt-4 text-sm font-bold text-muted">
            {" "}
            Showing {filteredTasks.length} of {tasks.length} tasks{" "}
          </p>{" "}
        </section>{" "}
        {filteredTasks.length === 0 ? (
          <div className="theme-card flex min-h-72 items-center justify-center p-8 text-center">
            {" "}
            <div>
              {" "}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                {" "}
                <ListTodo size={26} />{" "}
              </div>{" "}
              <h2 className="mt-4 text-xl font-black">No tasks found</h2>{" "}
              <p className="mt-2 text-sm text-muted">
                {" "}
                Assigned tasks will appear here.{" "}
              </p>{" "}
            </div>{" "}
          </div>
        ) : (
          <section className="grid gap-4">
            {" "}
            {filteredTasks.map((task) => (
              <Link
                key={task._id}
                href={`/tasks/${task._id}`}
                className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
              >
                {" "}
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {" "}
                  <div>
                    {" "}
                    <div className="flex flex-wrap items-center gap-2">
                      {" "}
                      <h3 className="text-xl font-black text-foreground">
                        {" "}
                        {task.title}{" "}
                      </h3>{" "}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(task.status)}`}
                      >
                        {" "}
                        {task.status}{" "}
                      </span>{" "}
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${getPriorityClass(task.priority)}`}
                      >
                        {" "}
                        {task.priority}{" "}
                      </span>{" "}
                      {isOverdue(task) && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                          {" "}
                          Overdue{" "}
                        </span>
                      )}{" "}
                    </div>{" "}
                    <p className="mt-2 text-sm font-bold text-primary">
                      {" "}
                      {task?.project?.projectName || "No project"}{" "}
                    </p>{" "}
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                      {" "}
                      <span className="inline-flex items-center gap-2">
                        {" "}
                        <FolderKanban size={15} />{" "}
                        {task?.project?.service || "No service"}{" "}
                      </span>{" "}
                      {task?.dueDate && (
                        <span className="inline-flex items-center gap-2">
                          {" "}
                          <CalendarClock size={15} /> Due:{" "}
                          {formatDate(task.dueDate)}{" "}
                        </span>
                      )}{" "}
                      <span className="inline-flex items-center gap-2">
                        {" "}
                        <Clock size={15} /> Created{" "}
                        {formatDate(task.createdAt)}{" "}
                      </span>{" "}
                    </div>{" "}
                    {task?.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted">
                        {" "}
                        {task.description}{" "}
                      </p>
                    )}{" "}
                  </div>{" "}
                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {" "}
                    {task?.status === "Done" ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700">
                        {" "}
                        <CheckCircle2 size={14} /> Completed{" "}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                        {" "}
                        <UserCog size={14} /> Assigned{" "}
                      </span>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </Link>
            ))}{" "}
          </section>
        )}{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
