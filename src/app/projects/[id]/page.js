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
  client?.companyName || client?.company || "No company added";

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
    <div className="rounded-2xl border border-border bg-surface-alt p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-muted">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-bold text-foreground">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
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

      const payload = {
        status: form.status,
        assignedTo: form.assignedTo || null,
        deadline: form.deadline || null,
        notes: form.notes,
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
            <Loader2 className="animate-spin text-primary" size={36} />
            <h2 className="mt-4 text-xl font-black">Loading Project</h2>
            <p className="mt-2 text-sm text-muted">
              Fetching complete project details...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !project) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card max-w-md p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>

            <h2 className="mt-4 text-xl font-black">Project Error</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{error}</p>

            <div className="mt-5 flex justify-center gap-3">
              <Link href="/projects" className="theme-btn-outline">
                Back
              </Link>

              <button onClick={fetchProject} className="theme-btn">
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
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-1/2 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <Link
                href="/projects"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft size={17} />
                Back to Projects
              </Link>

              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Project Detail
              </p>

              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {getProjectName(project)}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                {project?.service || "No service added"} project for{" "}
                {getClientName(project?.client)}.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-4 py-2 text-xs font-black ${getStatusClass(
                    project?.status,
                  )}`}
                >
                  {project?.status || "Not Started"}
                </span>

                <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                  Created {formatDate(project?.createdAt)}
                </span>

                {project?.deadline && (
                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-black text-white">
                    Deadline {formatDate(project.deadline)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {project?.client?.phone && (
                <a
                  href={`tel:${project.client.phone}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
                >
                  <Phone size={18} />
                  Call Client
                </a>
              )}

              {project?.client?.phone && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              )}

              {project?.client?.email && (
                <a
                  href={`mailto:${project.client.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Mail size={18} />
                  Email
                </a>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
            {success}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Project Information</h2>
                  <p className="mt-1 text-sm text-muted">
                    Client delivery and project details
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <FolderKanban size={22} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem
                  icon={FolderKanban}
                  label="Project Name"
                  value={getProjectName(project)}
                />

                <DetailItem
                  icon={Sparkles}
                  label="Service"
                  value={project?.service}
                />

                <DetailItem
                  icon={IndianRupee}
                  label="Budget"
                  value={formatBudget(project?.budget)}
                />

                <DetailItem
                  icon={CheckCircle2}
                  label="Status"
                  value={project?.status}
                />

                <DetailItem
                  icon={CalendarClock}
                  label="Deadline"
                  value={formatDate(project?.deadline)}
                />

                <DetailItem
                  icon={UserCog}
                  label="Assigned To"
                  value={
                    project?.assignedTo?.name ||
                    project?.assignedTo?.email ||
                    "Not assigned"
                  }
                />
              </div>

              {project?.notes && (
                <div className="mt-4 rounded-2xl border border-border bg-surface-alt p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-muted">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {project.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">Client Information</h2>
                  <p className="mt-1 text-sm text-muted">
                    Project connected client
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <Building2 size={22} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <DetailItem
                  icon={User}
                  label="Client"
                  value={getClientName(project?.client)}
                />

                <DetailItem
                  icon={Building2}
                  label="Company"
                  value={getCompanyName(project?.client)}
                />

                <DetailItem
                  icon={Phone}
                  label="Phone"
                  value={project?.client?.phone}
                />

                <DetailItem
                  icon={Mail}
                  label="Email"
                  value={project?.client?.email}
                />
              </div>

              {project?.client?._id && (
                <div className="mt-5">
                  <Link
                    href={`/clients/${project.client._id}`}
                    className="theme-btn-outline"
                  >
                    View Client
                  </Link>
                </div>
              )}
            </div>

            {(project?.activity || []).length > 0 && (
              <div className="theme-card p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-black">Project Activity</h2>
                  <p className="mt-1 text-sm text-muted">
                    Latest updates and project history
                  </p>
                </div>

                <div className="space-y-4">
                  {[...(project?.activity || [])]
                    .reverse()
                    .map((item, index) => (
                      <div
                        key={item?._id || index}
                        className="rounded-2xl border border-border bg-surface-alt p-4"
                      >
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                            <Clock size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-black text-foreground">
                              {item?.message ||
                                item?.action ||
                                "Project update"}
                            </p>

                            <p className="mt-1 text-xs font-bold text-muted">
                              {item?.createdBy?.name || "Team Member"} ·{" "}
                              {formatDate(item?.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Update Project</h2>
                <p className="mt-1 text-sm text-muted">
                  Change status, assignee and deadline
                </p>
              </div>

              <div className="space-y-4">
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
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                    className="theme-input"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black">Notes</label>

                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="theme-input min-h-32 resize-none"
                    placeholder="Update project scope or internal notes..."
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="theme-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
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

            <div className="theme-card p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black">Quick Actions</h2>
                <p className="mt-1 text-sm text-muted">
                  Manage delivery work for this project
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href={`/tasks/new?project=${project?._id}`}
                  className="theme-btn w-full"
                >
                  <Clock size={18} />
                  Add Task
                </Link>

                <Link
                  href={`/quotations/new?client=${project?.client?._id}`}
                  className="theme-btn-outline w-full"
                >
                  <FileText size={18} />
                  New Quotation
                </Link>

                <button
                  onClick={fetchProject}
                  className="theme-btn-outline w-full"
                >
                  <RefreshCcw size={18} />
                  Refresh Project
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">
                Project Reminder
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Assign tasks to team members after project creation so delivery
                progress can be tracked clearly.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </DashboardLayout>
  );
}
