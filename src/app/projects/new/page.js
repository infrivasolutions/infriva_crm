"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  FileText,
  FolderKanban,
  Loader2,
  Save,
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

const getCompanyName = (client) => client?.companyName || client?.company || "";

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
        budget: form.budget,
        status: form.status,
        assignedTo: form.assignedTo || null,
        deadline: form.deadline || null,
        notes: form.notes,
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
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="theme-card flex flex-col items-center p-8 text-center">
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
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="flex flex-col justify-between gap-4 rounded-[2rem] bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
              New Project
            </p>

            <h1 className="mt-2 text-3xl font-black">Create Project</h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Create a delivery project for website, CRM, SEO, automation,
              WhatsApp API or any custom client work.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={18} />
            Back to Projects
          </Link>
        </section>

        {selectedClient && (
          <section className="theme-card-soft p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <User size={22} />
              </div>

              <div>
                <p className="text-sm font-black text-primary">
                  Selected Client
                </p>

                <h2 className="mt-1 text-xl font-black text-foreground">
                  {getClientName(selectedClient)}
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {getCompanyName(selectedClient) || "No company added"}
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
              Project Information
            </h2>
            <p className="mt-1 text-sm text-muted">
              Fill the basic project details and assign team member.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black">
                Project Name <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <FolderKanban
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={form.projectName}
                  onChange={(e) => updateField("projectName", e.target.value)}
                  className="theme-input pl-11"
                  placeholder="Example: Ecommerce Website - ABC Store"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Client <span className="text-red-500">*</span>
              </label>

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
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">
                Service <span className="text-red-500">*</span>
              </label>

              <input
                value={form.service}
                onChange={(e) => updateField("service", e.target.value)}
                className="theme-input"
                placeholder="Website, CRM, SEO, Automation..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black">Budget</label>

              <input
                value={form.budget}
                onChange={(e) => updateField("budget", e.target.value)}
                className="theme-input"
                placeholder="25000"
              />
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
              <label className="mb-2 block text-sm font-black">Deadline</label>

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
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-black">Notes</label>

              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-4 top-4 text-muted"
                />

                <textarea
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="theme-input min-h-32 resize-none pl-11"
                  placeholder="Project scope, features, client requirements, delivery notes..."
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/projects" className="theme-btn-outline">
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
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
