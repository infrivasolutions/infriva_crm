"use client";

import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RoleGuard({ allowedRoles = [], children }) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");
    const storedUser = localStorage.getItem("infriva_user");

    if (!token) {
      router.replace("/login");
      return;
    }

    let user = null;

    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch {
      user = null;
    }

    if (!user?.role) {
      setAllowed(false);
      setMessage("User role not found. Please login again.");
      setChecking(false);
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      setAllowed(false);
      setMessage("You do not have permission to access this page.");
      setChecking(false);
      return;
    }

    setAllowed(true);
    setChecking(false);
  }, [allowedRoles, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="theme-card flex flex-col items-center p-8 text-center">
          <Loader2 className="animate-spin text-primary" size={36} />
          <h2 className="mt-4 text-xl font-black">Checking Access</h2>
          <p className="mt-2 text-sm text-muted">
            Verifying your CRM permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="theme-card max-w-md p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={28} />
          </div>

          <h2 className="mt-4 text-2xl font-black">Access Denied</h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            {message || "You are not allowed to access this page."}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => router.replace("/dashboard")}
              className="theme-btn"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => {
                localStorage.removeItem("infriva_token");
                localStorage.removeItem("infriva_user");
                router.replace("/login");
              }}
              className="theme-btn-outline"
            >
              Login Again
            </button>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-bold text-red-600">
            <AlertCircle size={14} />
            Role based route protection enabled
          </div>
        </div>
      </div>
    );
  }

  return children;
}
