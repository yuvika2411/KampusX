import { GraduationCap, Briefcase, Wrench, Shield, User } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function formatRoleName(role: string): string {
  if (!role) return "User";
  switch (role.toUpperCase()) {
    case "STUDENT":
      return "Student";
    case "CATEGORY_HEAD":
      return "Category Head";
    case "RESOLVER":
      return "Resolver";
    case "ADMIN":
      return "Administrator";
    default:
      return role
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default function RoleBadge({ role, size = "md", className = "" }: RoleBadgeProps) {
  const normalized = (role || "").toUpperCase();

  let colorClasses = "bg-soft text-ink border-line";
  let IconComponent = User;

  if (normalized === "STUDENT") {
    colorClasses = "bg-indigo-500/10 text-indigo-500 border-indigo-500/30";
    IconComponent = GraduationCap;
  } else if (normalized === "CATEGORY_HEAD") {
    colorClasses = "bg-purple-500/10 text-purple-400 border-purple-500/30";
    IconComponent = Briefcase;
  } else if (normalized === "RESOLVER") {
    colorClasses = "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    IconComponent = Wrench;
  } else if (normalized === "ADMIN") {
    colorClasses = "bg-rose-500/10 text-rose-500 border-rose-500/30";
    IconComponent = Shield;
  }

  const sizeClasses =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : size === "lg"
      ? "text-xs px-3.5 py-1.5 gap-2"
      : "text-xs px-2.5 py-1 gap-1.5";

  const iconSizes = size === "sm" ? 11 : size === "lg" ? 14 : 12;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border tracking-wide uppercase ${sizeClasses} ${colorClasses} ${className}`}
    >
      <IconComponent size={iconSizes} className="shrink-0" />
      <span>{formatRoleName(role)}</span>
    </span>
  );
}
