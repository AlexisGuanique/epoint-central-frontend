"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Header } from "@/components/layout/Header";
import { StatusBadge, VerificationBadge } from "@/components/ui/Badge";
import { Card, PageContent } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { translateStatus } from "@/i18n";
import { api } from "@/lib/api";
import type { Board, Client } from "@/types/api";

export default function ClienteDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { token } = useAuth();
  const { t, locale } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [board, setBoard] = useState<Board | null>(null);

  useEffect(() => {
    if (!token || !id) return;
    api.get<Client>(`/clients/${id}`, token).then(setClient);
    api.get<Board>(`/boards/client/${id}`, token).then(setBoard).catch(() => {});
  }, [token, id]);

  if (!client) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <LoadingSpinner label={t("clientDetail.loading")} />
      </div>
    );
  }

  return (
    <>
      <Header
        title={`${client.first_name} ${client.last_name}`}
        subtitle={client.email}
        actions={
          <Link href="/clientes" className="btn btn-secondary btn-sm">
            ← {t("common.back")}
          </Link>
        }
      />
      <PageContent className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("common.status")}</p>
              <div className="mt-2"><StatusBadge status={client.status} /></div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("clientDetail.phone")}</p>
              <p className="mt-1 font-medium text-slate-800">{client.phone}</p>
            </div>
          </div>
          {client.rejection_reason && (
            <div className="alert alert-error mt-4">
              <strong>{t("clientDetail.rejectionReason")}</strong> {client.rejection_reason}
            </div>
          )}
        </Card>

        {client.documents && client.documents.length > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">{t("clientDetail.documents")}</h2>
            <div className="space-y-3">
              {client.documents.map((d) => (
                <div
                  key={d.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {translateStatus(locale, "documentTypes", d.type)}
                    </p>
                    <p className="text-sm text-slate-500">{d.original_filename}</p>
                  </div>
                  <VerificationBadge status={d.verification_status} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {board && (
          <Card className="p-6">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">
              {t("clientDetail.board")}
            </h2>
            <p className="text-slate-600">
              {t("clientDetail.boardSummary", {
                tasks: board.lists.reduce((acc, l) => acc + l.cards.length, 0),
                columns: board.lists.length,
              })}
            </p>
          </Card>
        )}
      </PageContent>
    </>
  );
}
