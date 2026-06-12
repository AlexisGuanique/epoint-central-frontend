"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { VerificationBadge } from "@/components/ui/Badge";
import { Card, PageContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { translateStatus } from "@/i18n";
import { api } from "@/lib/api";
import { DOCUMENT_TYPES, type Client } from "@/types/api";

export default function PortalDocumentosPage() {
  const { token } = useAuth();
  const { t, locale } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function reload() {
    if (!token) return;
    api.get<Client>("/portal/me", token).then(setClient);
  }

  useEffect(() => {
    reload();
  }, [token]);

  async function handleUpload(docType: string, file: File) {
    if (!token) return;
    setUploading(docType);
    setMessage("");
    setIsError(false);
    try {
      const urlData = await api.post<{ upload_url: string; storage_key: string }>(
        "/documents/upload-url",
        { document_type: docType, filename: file.name, content_type: file.type },
        token,
      );
      await fetch(urlData.upload_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await api.post(
        "/documents/confirm",
        {
          document_type: docType,
          storage_key: urlData.storage_key,
          original_filename: file.name,
          mime_type: file.type,
        },
        token,
      );
      setMessage(t("portalDocs.uploadSuccess"));
      setIsError(false);
      reload();
    } catch {
      setMessage(t("portalDocs.uploadError"));
      setIsError(true);
    } finally {
      setUploading(null);
    }
  }

  return (
    <>
      <Header title={t("portalDocs.title")} subtitle={t("portalDocs.subtitle")} />
      <PageContent className="space-y-4">
        {message && (
          <div className={`alert ${isError ? "alert-error" : "alert-success"}`}>
            {message}
          </div>
        )}
        <p className="text-sm leading-relaxed text-slate-600">{t("portalDocs.instructions")}</p>
        <div className="grid gap-4">
          {DOCUMENT_TYPES.map((dt) => {
            const doc = client?.documents?.find((d) => d.type === dt.value);
            const label = translateStatus(locale, "documentTypes", dt.value);
            return (
              <Card key={dt.value} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{label}</h3>
                      {doc ? (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-slate-500">{doc.original_filename}</span>
                          <VerificationBadge status={doc.verification_status} />
                        </div>
                      ) : (
                        <span className="badge badge-amber mt-1">{t("portalDocs.pendingUpload")}</span>
                      )}
                    </div>
                  </div>
                  <label className="cursor-pointer">
                    <span className={`btn btn-primary btn-sm ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                      {uploading === dt.value ? t("common.uploading") : t("common.upload")}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      disabled={!!uploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(dt.value, f);
                      }}
                    />
                  </label>
                </div>
              </Card>
            );
          })}
        </div>
      </PageContent>
    </>
  );
}
