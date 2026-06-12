"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { TaskStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PageContent } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { useModal } from "@/contexts/ModalContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { translateStatus } from "@/i18n";
import { api } from "@/lib/api";
import type { Board, BoardCard } from "@/types/api";

export default function PortalTableroPage() {
  const { token, user } = useAuth();
  const { t, locale } = useTranslation();
  const modal = useModal();
  const [board, setBoard] = useState<Board | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<BoardCard | null>(null);
  const [comment, setComment] = useState("");
  const [creds, setCreds] = useState({ username: "", password: "" });

  function load() {
    if (!token || !user?.client_id) return;
    api
      .get<Board>(`/boards/client/${user.client_id}`, token)
      .then(setBoard)
      .catch(() => setError(t("portalBoard.unavailable")));
  }

  useEffect(() => {
    load();
  }, [token, user]);

  async function updateStatus(cardId: number, status: string) {
    if (!token) return;
    await api.patch(`/boards/cards/${cardId}/status`, { status }, token);
    load();
  }

  async function submitComment(cardId: number) {
    if (!token || !comment.trim()) return;
    await api.post(`/boards/cards/${cardId}/comments`, { body: comment }, token);
    setComment("");
    load();
    setSelected(null);
  }

  async function submitCredentials(cardId: number) {
    if (!token) return;
    await api.post(`/boards/cards/${cardId}/credentials`, creds, token);
    setCreds({ username: "", password: "" });
    await modal.alert({
      title: t("portalBoard.saveCredentials"),
      message: t("portalBoard.credentialsSaved"),
      variant: "success",
    });
    load();
  }

  const statusOptions = ["PENDIENTE", "EN_PROGRESO", "EN_REVISION", "COMPLETADA"] as const;

  return (
    <>
      <Header title={t("portalBoard.title")} subtitle={t("portalBoard.subtitle")} />
      <PageContent>
        {error && <div className="alert alert-info mb-4">{error}</div>}
        {!board && !error && (
          <div className="flex justify-center py-16">
            <LoadingSpinner label={t("portalBoard.loading")} />
          </div>
        )}
        {board && (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {board.lists.map((list) => (
              <div key={list.id} className="kanban-column w-80 shrink-0 p-3">
                <h3 className="mb-3 px-1 text-sm font-bold uppercase tracking-wider text-slate-500">
                  {list.title}
                </h3>
                <div className="space-y-2">
                  {list.cards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelected(card)}
                      className="kanban-card w-full text-left"
                    >
                      <p className="text-sm font-semibold text-slate-800">{card.title}</p>
                      <span className="mt-2 inline-block">
                        <TaskStatusBadge status={card.status} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContent>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
            {selected.instructions_md && (
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {selected.instructions_md}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(selected.id, s)}
                  className={`badge cursor-pointer transition ${selected.status === s ? "badge-blue ring-2 ring-blue-300" : "badge-slate hover:ring-1 hover:ring-slate-300"}`}
                >
                  {translateStatus(locale, "taskStatus", s)}
                </button>
              ))}
            </div>
            {selected.requires_credentials && (
              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-slate-800">{t("portalBoard.credentialsTitle")}</p>
                <Input
                  placeholder={t("portalBoard.username")}
                  value={creds.username}
                  onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                />
                <PasswordInput
                  placeholder={t("portalBoard.password")}
                  value={creds.password}
                  onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                  showLabel={t("login.showPassword")}
                  hideLabel={t("login.hidePassword")}
                />
                <Button type="button" onClick={() => submitCredentials(selected.id)}>
                  {t("portalBoard.saveCredentials")}
                </Button>
              </div>
            )}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <textarea
                className="input-field min-h-[5rem] resize-y"
                rows={3}
                placeholder={t("portalBoard.commentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button type="button" variant="secondary" className="mt-3" onClick={() => submitComment(selected.id)}>
                {t("common.comment")}
              </Button>
            </div>
            <button type="button" className="btn btn-ghost btn-sm mt-4" onClick={() => setSelected(null)}>
              {t("common.close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
