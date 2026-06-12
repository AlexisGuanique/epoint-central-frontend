export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-400" />
      </div>
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );
}
