type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "success" | "warning";
};

export function StatusBadge({ children, tone = "success" }: StatusBadgeProps) {
  const toneClass = tone === "success" ? "bg-herb/10 text-herb" : "bg-tomato/10 text-tomato";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  );
}

