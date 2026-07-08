"use client";

import { useState } from "react";
import { FileSpreadsheet, Loader2, UploadCloud, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ImportLeadsExcel({ onImported }) {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleImport = async () => {
    try {
      if (!file) {
        setError("Please select an Excel file first");
        return;
      }

      setImporting(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("file", file);

      const data = await apiFetch("/leads/import-excel", {
        method: "POST",
        body: formData,
      });

      setResult(data);
      setFile(null);

      if (onImported) {
        onImported();
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to import leads");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-2xl bg-primary-light p-3 text-primary">
          <FileSpreadsheet size={22} />
        </div>

        <div>
          <h3 className="text-lg font-black text-foreground">
            Import Leads from Excel
          </h3>
          <p className="text-sm text-muted">
            Upload .xlsx, .xls or .csv file. Duplicate phone/email leads will be
            skipped.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setError("");
            setResult(null);
          }}
          className="theme-input w-full cursor-pointer"
        />

        {file && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt px-4 py-3 text-sm">
            <span className="font-semibold text-foreground">{file.name}</span>

            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-red-500 hover:text-red-700"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-surface-alt p-4 text-sm md:grid-cols-5">
            <div>
              <p className="text-muted">Total</p>
              <p className="text-lg font-black text-foreground">
                {result.totalRows || 0}
              </p>
            </div>

            <div>
              <p className="text-muted">Created</p>
              <p className="text-lg font-black text-green-600">
                {result.created || 0}
              </p>
            </div>

            <div>
              <p className="text-muted">Duplicates</p>
              <p className="text-lg font-black text-yellow-600">
                {result.duplicates || 0}
              </p>
            </div>

            <div>
              <p className="text-muted">Invalid</p>
              <p className="text-lg font-black text-red-600">
                {result.invalid || 0}
              </p>
            </div>

            <div>
              <p className="text-muted">Failed</p>
              <p className="text-lg font-black text-red-600">
                {result.failed || 0}
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={importing}
          className="theme-btn flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {importing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <UploadCloud size={18} />
              Import Leads
            </>
          )}
        </button>
      </div>
    </div>
  );
}
