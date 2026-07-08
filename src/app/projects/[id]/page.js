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
  FileText,
  FolderKanban,
  IndianRupee,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCcw,
  Save,
  Sparkles,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
const statusOptions = [
  "Not Started",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];
const getProjectName = (project) => project?.projectName || "Untitled Project";
const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";
const getCompanyName = (client) =>
  client?.companyName ||
  client?.company ||
  client?.businessName ||
  "No company added";
const getAssignedName = (project) =>
  project?.assignedTo?.name || project?.assignedTo?.email || "Not assigned";
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
const toDateInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};
const formatBudget = (budget) => {
  const amount = Number(budget || 0);
  if (!amount) return "—";
  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-3xl border border-border bg-surface-alt p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-purple-100 sm:p-4">
      {" "}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {" "}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm transition group-hover:bg-primary group-hover:text-white">
          {" "}
          <Icon size={18} />{" "}
        </div>{" "}
        <div className="min-w-0">
          {" "}
          <p className="text-[10px] font-black uppercase tracking-wider text-muted sm:text-xs">
            {" "}
            {label}{" "}
          </p>{" "}
          <p className="mt-1 wrap-break-word text-xs font-black text-foreground sm:text-sm">
            {" "}
            {value || "—"}{" "}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
function FormSection({ title, desc, icon: Icon, children }) {
  return (
    <section className="theme-card p-4 sm:p-6">
      {" "}
      <div className="mb-5 flex items-start justify-between gap-4">
        {" "}
        <div>
          {" "}
          <h2 className="text-lg font-black text-foreground sm:text-xl">
            {" "}
            {title}{" "}
          </h2>{" "}
          <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">
            {" "}
            {desc}{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
          {" "}
          <Icon size={22} />{" "}
        </div>{" "}
      </div>{" "}
      {children}{" "}
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
      {" "}
      <Icon size={17} /> {children}{" "}
    </a>
  );
}
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    status: "Not Started",
    assignedTo: "",
    deadline: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      const res = await apiFetch(`/projects/${projectId}`);
      const projectData = res?.project || res?.data;
      if (!projectData) {
        throw new Error("Project not found");
      }
      setProject(projectData);
      setForm({
        status: projectData?.status || "Not Started",
        assignedTo: projectData?.assignedTo?._id || "",
        deadline: toDateInputValue(projectData?.deadline),
        notes: projectData?.notes || "",
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
      setError(err?.message || "Failed to load project");
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
    if (projectId) {
      fetchProject();
      fetchMembers();
    }
  }, [projectId, router]);
  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const payload = {
        status: form.status,
        assignedTo: form.assignedTo || null,
        deadline: form.deadline || null,
        notes: form.notes.trim(),
      };
      const res = await apiFetch(`/projects/${projectId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const updatedProject = res?.project || res?.data;
      if (updatedProject) {
        setProject(updatedProject);
      } else {
        await fetchProject();
      }
      setSuccess("Project updated successfully");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };
  const whatsappLink = useMemo(() => {
    const phone = String(project?.client?.phone || "").replace(/\D/g, "");
    if (!phone) return "#";
    const message = encodeURIComponent(
      `Hello ${getClientName(project?.client)}, this is Infriva Solutions. Sharing an update regarding your project: ${getProjectName(project)}.`,
    );
    return `https://wa.me/91${phone.slice(-10)}?text=${message}`;
  }, [project]);
  const progress = getProgress(project?.status);
  if (loading) {
    return (
      <DashboardLayout>
        {" "}
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          {" "}
          <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
            {" "}
            <Loader2 className="animate-spin text-primary" size={36} />{" "}
            <h2 className="mt-4 text-xl font-black">Loading Project</h2>{" "}
            <p className="mt-2 text-sm text-muted">
              {" "}
              Fetching complete project details...{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  if (error && !project) {
    return (
      <DashboardLayout>
        {" "}
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          {" "}
          <div className="theme-card w-full max-w-md p-8 text-center">
            {" "}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {" "}
              <AlertCircle size={26} />{" "}
            </div>{" "}
            <h2 className="mt-4 text-xl font-black">Project Error</h2>{" "}
            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>{" "}
            <div className="mt-5 flex justify-center gap-3">
              {" "}
              <Link href="/projects" className="theme-btn-outline">
                {" "}
                Back{" "}
              </Link>{" "}
              <button
                type="button"
                onClick={fetchProject}
                className="theme-btn"
              >
                {" "}
                Try Again{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      {" "}
      <div className="space-y-5 sm:space-y-6">
        {" "}
        <section className="relative overflow-hidden rounded-4xl bg-primary p-5 text-white shadow-2xl shadow-purple-200 sm:p-6 lg:p-8">
          {" "}
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />{" "}
          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            {" "}
            <div className="min-w-0">
              {" "}
              <Link
                href="/projects"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white backdrop-blur transition hover:bg-white/20 sm:text-sm"
              >
                {" "}
                <ArrowLeft size={17} /> Back to Projects{" "}
              </Link>{" "}
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70 sm:text-sm sm:tracking-[0.25em]">
                {" "}
                Project Detail{" "}
              </p>{" "}
              <h1 className="mt-2 wrap-break-word text-2xl font-black leading-tight sm:text-4xl">
                {" "}
                {getProjectName(project)}{" "}
              </h1>{" "}
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                {" "}
                {project?.service || "No service added"} project for{" "}
                {getClientName(project?.client)}.{" "}
              </p>{" "}
              <div className="mt-5 flex flex-wrap gap-2">
                {" "}
                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black sm:px-4 sm:text-xs ${getStatusClass(project?.status)}`}
                >
                  {" "}
                  {project?.status || "Not Started"}{" "}
                </span>{" "}
                <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                  {" "}
                  Created {formatDate(project?.createdAt)}{" "}
                </span>{" "}
                {project?.deadline && (
                  <span className="rounded-full bg-white/15 px-3 py-2 text-[11px] font-black text-white sm:px-4 sm:text-xs">
                    {" "}
                    Deadline {formatDate(project.deadline)}{" "}
                  </span>
                )}{" "}
              </div>{" "}
              <div className="mt-5 max-w-md">
                {" "}
                <div className="mb-2 flex items-center justify-between text-xs font-black text-white/70">
                  {" "}
                  <span>Project Progress</span> <span>{progress}%</span>{" "}
                </div>{" "}
                <div className="h-2 overflow-hidden rounded-full bg-white/20">
                  {" "}
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${progress}%` }}
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap xl:justify-end">
              {" "}
              {project?.client?.phone && (
                <HeroAction href={`tel:${project.client.phone}`} icon={Phone}>
                  {" "}
                  Call{" "}
                </HeroAction>
              )}{" "}
              {project?.client?.phone && (
                <HeroAction
                  href={whatsappLink}
                  icon={MessageCircle}
                  variant="glass"
                >
                  {" "}
                  WhatsApp{" "}
                </HeroAction>
              )}{" "}
              {project?.client?.email && (
                <HeroAction
                  href={`mailto:${project.client.email}`}
                  icon={Mail}
                  variant="glass"
                >
                  {" "}
                  Email{" "}
                </HeroAction>
              )}{" "}
            </div>{" "}
          </div>{" "}
        </section>{" "}
        {error && (
          <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {" "}
            <AlertCircle size={18} className="shrink-0" />{" "}
            <span>{error}</span>{" "}
          </div>
        )}{" "}
        {success && (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {" "}
            {success}{" "}
          </div>
        )}{" "}
        <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:gap-6">
          {" "}
          <div className="space-y-5 sm:space-y-6">
            {" "}
            <FormSection
              title="Project Information"
              desc="Client delivery and project details."
              icon={FolderKanban}
            >
              {" "}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                {" "}
                <DetailItem
                  icon={FolderKanban}
                  label="Project Name"
                  value={getProjectName(project)}
                />{" "}
                <DetailItem
                  icon={Sparkles}
                  label="Service"
                  value={project?.service}
                />{" "}
                <DetailItem
                  icon={IndianRupee}
                  label="Budget"
                  value={formatBudget(project?.budget)}
                />{" "}
                <DetailItem
                  icon={CheckCircle2}
                  label="Status"
                  value={project?.status}
                />{" "}
                <DetailItem
                  icon={CalendarClock}
                  label="Deadline"
                  value={formatDate(project?.deadline)}
                />{" "}
                <DetailItem
                  icon={UserCog}
                  label="Assigned To"
                  value={getAssignedName(project)}
                />{" "}
              </div>{" "}
              {project?.notes && (
                <div className="mt-4 rounded-3xl border border-border bg-surface-alt p-4">
                  {" "}
                  <p className="text-xs font-black uppercase tracking-wider text-muted">
                    {" "}
                    Notes{" "}
                  </p>{" "}
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {" "}
                    {project.notes}{" "}
                  </p>{" "}
                </div>
              )}{" "}
            </FormSection>{" "}
            <FormSection
              title="Client Information"
              desc="Project connected client."
              icon={Building2}
            >
              {" "}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-2">
                {" "}
                <DetailItem
                  icon={User}
                  label="Client"
                  value={getClientName(project?.client)}
                />{" "}
                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={getCompanyName(project?.client)}
                />{" "}
                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={project?.client?.phone}
                />{" "}
                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={project?.client?.email}
                />{" "}
              </div>{" "}
              {project?.client?._id && (
                <div className="mt-5">
                  {" "}
                  <Link
                    href={`/clients/${project.client._id}`}
                    className="theme-btn-outline w-full sm:w-fit"
                  >
                    {" "}
                    View Client{" "}
                  </Link>{" "}
                </div>
              )}{" "}
            </FormSection>{" "}
            {(project?.activity || []).length > 0 && (
              <FormSection
                title="Project Activity"
                desc="Latest updates and project history."
                icon={Clock}
              >
                {" "}
                <div className="space-y-4">
                  {" "}
                  {[...(project?.activity || [])]
                    .reverse()
                    .map((item, index) => (
                      <div
                        key={item?._id || index}
                        className="rounded-3xl border border-border bg-surface-alt p-4"
                      >
                        {" "}
                        <div className="flex gap-3">
                          {" "}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary">
                            {" "}
                            <Clock size={18} />{" "}
                          </div>{" "}
                          <div className="min-w-0">
                            {" "}
                            <p className="text-sm font-black text-foreground">
                              {" "}
                              {item?.message ||
                                item?.action ||
                                "Project update"}{" "}
                            </p>{" "}
                            <p className="mt-1 text-xs font-bold text-muted">
                              {" "}
                              {item?.createdBy?.name || "Team Member"} ·{" "}
                              {formatDate(item?.createdAt)}{" "}
                            </p>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>
                    ))}{" "}
                </div>{" "}
              </FormSection>
            )}{" "}
          </div>{" "}
          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            {" "}
            <div className="theme-card p-4 sm:p-6">
              {" "}
              <div className="mb-5">
                {" "}
                <h2 className="text-lg font-black sm:text-xl">
                  {" "}
                  Update Project{" "}
                </h2>{" "}
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {" "}
                  Change status, assignee and deadline.{" "}
                </p>{" "}
              </div>{" "}
              <div className="space-y-4">
                {" "}
                <div>
                  {" "}
                  <label className="mb-2 block text-sm font-black">
                    {" "}
                    Status{" "}
                  </label>{" "}
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="theme-input"
                  >
                    {" "}
                    {statusOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}{" "}
                  </select>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="mb-2 block text-sm font-black">
                    {" "}
                    Assign To{" "}
                  </label>{" "}
                  <select
                    value={form.assignedTo}
                    onChange={(e) => updateField("assignedTo", e.target.value)}
                    className="theme-input"
                    disabled={membersLoading}
                  >
                    {" "}
                    <option value="">Not Assigned</option>{" "}
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {" "}
                        {member.name} - {member.role}{" "}
                      </option>
                    ))}{" "}
                  </select>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="mb-2 block text-sm font-black">
                    {" "}
                    Deadline{" "}
                  </label>{" "}
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                    className="theme-input"
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label className="mb-2 block text-sm font-black">
                    Notes
                  </label>{" "}
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="theme-input min-h-32 resize-none"
                    placeholder="Update project scope or internal notes..."
                  />{" "}
                </div>{" "}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="theme-btn hidden w-full disabled:cursor-not-allowed disabled:opacity-60 sm:flex"
                >
                  {" "}
                  {saving ? (
                    <>
                      {" "}
                      <Loader2 size={18} className="animate-spin" />{" "}
                      Saving...{" "}
                    </>
                  ) : (
                    <>
                      {" "}
                      <Save size={18} /> Save Changes{" "}
                    </>
                  )}{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <div className="theme-card p-4 sm:p-6">
              {" "}
              <div className="mb-5">
                {" "}
                <h2 className="text-lg font-black sm:text-xl">
                  {" "}
                  Quick Actions{" "}
                </h2>{" "}
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  {" "}
                  Manage delivery work for this project.{" "}
                </p>{" "}
              </div>{" "}
              <div className="space-y-3">
                {" "}
                <Link
                  href={`/tasks/new?project=${project?._id}`}
                  className="theme-btn w-full"
                >
                  {" "}
                  <Clock size={18} /> Add Task{" "}
                </Link>{" "}
                <Link
                  href={`/quotations/new?client=${project?.client?._id}`}
                  className="theme-btn-outline w-full"
                >
                  {" "}
                  <FileText size={18} /> New Quotation{" "}
                </Link>{" "}
                <button
                  type="button"
                  onClick={fetchProject}
                  className="theme-btn-outline w-full"
                >
                  {" "}
                  <RefreshCcw size={18} /> Refresh Project{" "}
                </button>{" "}
              </div>{" "}
            </div>{" "}
            <div className="rounded-4xl border border-border bg-primary-light p-5">
              {" "}
              <p className="text-sm font-black text-primary">
                {" "}
                Project Reminder{" "}
              </p>{" "}
              <p className="mt-2 text-sm leading-7 text-muted">
                {" "}
                Assign tasks to team members after project creation so delivery
                progress can be tracked clearly.{" "}
              </p>{" "}
            </div>{" "}
          </aside>{" "}
        </section>{" "}
        <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
          {" "}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="theme-btn w-full rounded-2xl text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {" "}
            {saving ? (
              <>
                {" "}
                <Loader2 size={16} className="animate-spin" /> Saving{" "}
              </>
            ) : (
              <>
                {" "}
                <Save size={16} /> Save Changes{" "}
              </>
            )}{" "}
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </DashboardLayout>
  );
}
