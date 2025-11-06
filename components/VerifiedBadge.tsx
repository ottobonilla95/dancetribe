import { FaCheck } from "react-icons/fa";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function VerifiedBadge({ size = "md", className = "" }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "w-4 h-4 text-[10px]",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm"
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-blue-500 ${sizeClasses[size]} ${className}`}
      title="Verified Professional"
      aria-label="Verified Professional"
    >
      <FaCheck className="text-white" />
    </span>
  );
}

