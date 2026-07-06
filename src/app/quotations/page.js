"use client";

import DashboardLayout from "@/components/crm/DashboardLayout";
import RoleGuard from "@/components/crm/RoleGuard";
import { apiFetch } from "@/lib/api";
import {
  AlertCircle,
  CalendarClock,
  FileText,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const statusOptions = ["All", "Draft", "Sent", "Accepted", "Rejected"];

const getQuotationTitle = (quotation) =>
  quotation?.quotationTitle ||
  quotation?.title ||
  quotation?.quotationNo ||
  quotation?.quoteNo ||
  "Untitled Quotation";

const getClientName = (quotation) =>
  quotation?.client?.clientName ||
  quotation?.client?.name ||
  quotation?.clientName ||
  "No client";

const getStatusClass = (status = "") => {
  if (status === "Accepted") return "bg-green-50 text-green-700";
  if (status === "Rejected") return "bg-red-50 text-red-700";
  if (status === "Expired") return "bg-orange-50 text-orange-700";
  if (status === "Sent") return "bg-blue-50 text-blue-700";

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

const formatAmount = (amount) => {
  const value = Number(amount || 0);

  if (!value) return "—";

  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
};

export default function QuotationsPage() {
  const router = useRouter();

  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiFetch("/quotations");
      setQuotations(res?.quotations || res?.data || []);
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

      setError(err?.message || "Failed to fetch quotations");
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

    fetchQuotations();
  }, [router]);

  const filteredQuotations = useMemo(() => {
    const value = search.toLowerCase();

    return quotations.filter((quotation) => {
      const matchesSearch =
        getQuotationTitle(quotation).toLowerCase().includes(value) ||
        getClientName(quotation).toLowerCase().includes(value) ||
        quotation?.service?.toLowerCase().includes(value) ||
        quotation?.quotationNo?.toLowerCase().includes(value) ||
        quotation?.quoteNo?.toLowerCase().includes(value);

      const matchesStatus = status === "All" || quotation?.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, status]);

  return (
    <RoleGuard allowedRoles={["admin", "ads-manager"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <section className="flex flex-col justify-between gap-4 rounded-4xl bg-primary p-6 text-white shadow-2xl shadow-purple-200 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Quotation Management
              </p>

              <h1 className="mt-2 text-3xl font-black">Quotations</h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Create, track and manage client quotations, proposals and
                pricing.
              </p>
            </div>

            <Link
              href="/quotations/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-primary transition hover:bg-primary-light"
            >
              <Plus size={18} />
              New Quotation
            </Link>
          </section>

          <section className="theme-card p-4">
            <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by quotation, client, service..."
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
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
              <SlidersHorizontal size={16} />
              Showing {filteredQuotations.length} of {quotations.length}{" "}
              quotations
            </div>
          </section>

          {loading ? (
            <div className="theme-card flex min-h-90 items-center justify-center p-8">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-primary"
                  size={36}
                />
                <h2 className="mt-4 text-xl font-black">Loading quotations</h2>
                <p className="mt-2 text-sm text-muted">
                  Fetching latest quotation data...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <AlertCircle size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">Error</h2>
                <p className="mt-2 text-sm text-muted">{error}</p>

                <button onClick={fetchQuotations} className="theme-btn mt-5">
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="theme-card flex min-h-80 items-center justify-center p-8 text-center">
              <div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
                  <FileText size={26} />
                </div>

                <h2 className="mt-4 text-xl font-black">No quotations found</h2>
                <p className="mt-2 text-sm text-muted">
                  Create your first quotation for a client.
                </p>

                <Link href="/quotations/new" className="theme-btn mt-5">
                  Create Quotation
                </Link>
              </div>
            </div>
          ) : (
            <section className="grid gap-4">
              {filteredQuotations.map((quotation) => (
                <Link
                  key={quotation._id}
                  href={`/quotations/${quotation._id}`}
                  className="theme-card-soft block p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-foreground">
                          {getQuotationTitle(quotation)}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${getStatusClass(
                            quotation?.status,
                          )}`}
                        >
                          {quotation?.status || "Draft"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-bold text-primary">
                        {quotation?.service || "Service not added"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                        <span className="inline-flex items-center gap-2">
                          <User size={15} />
                          {getClientName(quotation)}
                        </span>

                        <span className="inline-flex items-center gap-2">
                          <IndianRupee size={15} />
                          {formatAmount(
                            quotation?.totalAmount ||
                              quotation?.amount ||
                              quotation?.grandTotal,
                          )}
                        </span>

                        {(quotation?.validTill || quotation?.expiryDate) && (
                          <span className="inline-flex items-center gap-2">
                            <CalendarClock size={15} />
                            Valid till:{" "}
                            {formatDate(
                              quotation?.validTill || quotation?.expiryDate,
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                        Created {formatDate(quotation.createdAt)}
                      </span>

                      {quotation?.createdBy?.name && (
                        <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-foreground">
                          By: {quotation.createdBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
