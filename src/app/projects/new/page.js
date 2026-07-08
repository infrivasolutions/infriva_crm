"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  FileText,
  FolderKanban,
  IndianRupee,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = [
  "Not Started",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];

const getClientName = (client) =>
  client?.clientName || client?.name || "Unnamed Client";

const getCompanyName = (client) =>
  client?.companyName || client?.company || client?.businessName || "";

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

function SelectedClientCard({ client }) {
  if (!client) return null;

  return (
    <section className="relative overflow-hidden rounded-[1.7rem] border border-border bg-white p-4 shadow-sm sm:rounded-4xl sm:p-5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary shadow-lg shadow-purple-100">
          <User size={22} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-primary">
            Selected Client
          </p>

          <h2 className="mt-1 truncate text-lg font-black text-foreground sm:text-xl">
            {getClientName(client)}
          </h2>

          <p className="mt-1 truncate text-sm font-semibold text-muted">
            {getCompanyName(client) || "No company added"}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function NewProjectPage() {
  const router = useRouter();

  const [clients, setClients] = useState([]);
  const [members, setMembers] = useState([]);

  const [form, setForm] = useState({
    projectName: "",
    client: "",
    service: "",
    budget: "",
    status: "Not Started",
    assignedTo: "",
    deadline: "",
    notes: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      setError("");

      const params = new URLSearchParams(window.location.search);
      const selectedClient = params.get("client") || "";

      const clientsRes = await apiFetch("/clients");
      const clientsData = clientsRes?.clients || clientsRes?.data || [];

      setClients(clientsData);

      setForm((prev) => ({
        ...prev,
        client: selectedClient,
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

      setError(err?.message || "Failed to load project form");
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
  }, [router]);

  const selectedClient = useMemo(() => {
    return clients.find((client) => client._id === form.client);
  }, [clients, form.client]);

  const selectedMember = useMemo(() => {
    return members.find((member) => member._id === form.assignedTo);
  }, [members, form.assignedTo]);

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

      if (!form.projectName.trim()) {
        throw new Error("Project name is required");
      }

      if (!form.client) {
        throw new Error("Please select a client");
      }

      if (!form.service.trim()) {
        throw new Error("Service is required");
      }

      const payload = {
        projectName: form.projectName.trim(),
        client: form.client,
        service: form.service.trim(),
        budget: form.budget.trim(),
        status: form.status,
        assignedTo: form.assignedTo || null,
        deadline: form.deadline || null,
        notes: form.notes.trim(),
      };

      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const projectId = res?.project?._id || res?.data?._id;

      if (projectId) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push("/projects");
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create project");
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

            <h2 className="mt-4 text-xl font-black">Loading Project Form</h2>

            <p className="mt-2 text-sm text-muted">
              Fetching clients and team members...
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
                New Project
              </p>

              <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
                Create Project
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Create a delivery project for website, CRM, SEO, automation,
                WhatsApp API or any custom client work.
              </p>
            </div>

            <Link
              href="/projects"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 sm:w-fit sm:rounded-full"
            >
              <ArrowLeft size={18} />
              Back to Projects
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
              title="Project Information"
              desc="Add client, project name, service and budget details."
              icon={FolderKanban}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Project Name" required icon={FolderKanban}>
                  <div className="relative">
                    <FolderKanban
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      value={form.projectName}
                      onChange={(e) =>
                        updateField("projectName", e.target.value)
                      }
                      className="theme-input pl-11"
                      placeholder="Ecommerce Website - ABC Store"
                    />
                  </div>
                </Field>

                <Field label="Client" required icon={User}>
                  <select
                    value={form.client}
                    onChange={(e) => updateField("client", e.target.value)}
                    className="theme-input"
                  >
                    <option value="">Select Client</option>

                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {getClientName(client)}
                        {getCompanyName(client)
                          ? ` - ${getCompanyName(client)}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Service" required icon={Sparkles}>
                  <input
                    value={form.service}
                    onChange={(e) => updateField("service", e.target.value)}
                    className="theme-input"
                    placeholder="Website, CRM, SEO, Automation..."
                  />
                </Field>

                <Field label="Budget" icon={IndianRupee}>
                  <input
                    value={form.budget}
                    onChange={(e) => updateField("budget", e.target.value)}
                    className="theme-input"
                    placeholder="25000"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Delivery Setup"
              desc="Set project status, team member and delivery deadline."
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

                <Field label="Deadline" icon={CalendarClock}>
                  <div className="relative">
                    <CalendarClock
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => updateField("deadline", e.target.value)}
                      className="theme-input pl-11"
                    />
                  </div>
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Project Notes"
              desc="Add scope, features, client requirements and delivery notes."
              icon={FileText}
            >
              <Field label="Notes" icon={FileText}>
                <div className="relative">
                  <FileText
                    size={18}
                    className="absolute left-4 top-4 text-muted"
                  />

                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    className="theme-input min-h-36 resize-none pl-11"
                    placeholder="Project scope, features, client requirements, delivery notes..."
                  />
                </div>
              </Field>
            </FormSection>

            <div className="hidden flex-col-reverse gap-3 sm:flex sm:flex-row sm:justify-end">
              <Link href="/projects" className="theme-btn-outline">
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
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>

          <aside className="space-y-5 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
            <SelectedClientCard client={selectedClient} />

            <div className="theme-card p-4 sm:p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <FolderKanban size={24} />
              </div>

              <h2 className="text-lg font-black sm:text-xl">Project Preview</h2>

              <div className="mt-4 rounded-3xl bg-surface-alt p-4">
                <p className="text-sm font-black text-primary">
                  {form.projectName || "Project name not added"}
                </p>

                <p className="mt-2 text-sm leading-7 text-muted">
                  {form.service || "Service not selected yet"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
                    {form.status}
                  </span>

                  {selectedMember && (
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
                      {selectedMember.name}
                    </span>
                  )}

                  {form.deadline && (
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-foreground">
                      Deadline set
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-4xl border border-border bg-primary-light p-5">
              <p className="text-sm font-black text-primary">
                Project Reminder
              </p>

              <p className="mt-2 text-sm leading-7 text-muted">
                Always add clear scope and deadline before starting delivery.
                This keeps projects trackable for admin, ads manager and
                developer.
              </p>
            </div>
          </aside>
        </section>

        <div className="sticky bottom-3 z-20 rounded-3xl border border-border bg-white/90 p-3 shadow-2xl shadow-purple-100 backdrop-blur-xl sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/projects"
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
