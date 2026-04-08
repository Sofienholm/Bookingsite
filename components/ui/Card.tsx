import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export default function Card({
  children,
  className,
  onClick,
  selected = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl p-6 shadow-sm border transition-all duration-200",
        selected
          ? "border-rose-400 ring-2 ring-rose-200 shadow-md"
          : "border-rose-100",
        onClick && "cursor-pointer hover:shadow-md hover:border-rose-300",
        className
      )}
    >
      {children}
    </div>
  );
}
