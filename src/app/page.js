"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("infriva_token");

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="theme-card flex w-full max-w-sm flex-col items-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-white shadow-xl shadow-purple-200">
          <Sparkles size={28} />
        </div>

        <h1 className="mt-5 text-2xl font-black text-foreground">
          Infriva CRM
        </h1>

        <p className="mt-2 text-sm text-muted">
          Redirecting to your CRM panel...
        </p>

        <Loader2 className="mt-6 animate-spin text-primary" size={32} />
      </div>
    </main>
  );
}
