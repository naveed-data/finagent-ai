type StatusBadgeProps = {
  label: string;
  tone?: "green" | "blue" | "purple" | "yellow" | "red" | "gray";
};

const toneClasses = {
  green: "bg-emerald-500/15 text-emerald-400",
  blue: "bg-blue-500/15 text-blue-400",
  purple: "bg-purple-500/15 text-purple-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
  red: "bg-red-500/15 text-red-400",
  gray: "bg-neutral-500/15 text-neutral-300",
};

function StatusBadge({ label, tone = "gray" }: StatusBadgeProps) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
