const LOCALE_MAP = { es: "es-AR", en: "en-US" } as const;

export function formatDateTime(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const tag = locale === "en" ? LOCALE_MAP.en : LOCALE_MAP.es;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin >= 0 && diffMin < 1) {
    return locale === "en" ? "Just now" : "Hace un momento";
  }
  if (diffMin >= 1 && diffMin < 60) {
    return locale === "en" ? `${diffMin} min ago` : `Hace ${diffMin} min`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return locale === "en" ? `${diffHours} h ago` : `Hace ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return locale === "en" ? `${diffDays} d ago` : `Hace ${diffDays} d`;
  }

  return new Intl.DateTimeFormat(tag, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
