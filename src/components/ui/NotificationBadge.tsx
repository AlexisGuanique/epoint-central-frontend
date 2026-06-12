export function NotificationBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={`inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm ring-2 ring-white ${className}`}
      aria-label={`${count} notificaciones`}
    >
      {label}
    </span>
  );
}
