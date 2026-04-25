import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size: "sm" | "md" | "lg";
}

const LoadingSpinner = ({ size }: LoadingSpinnerProps) => {
  const sizeClasses = {
    lg: {
      wrapper: "h-16 w-16",
      ring: "border-[3px]",
      dot: "h-2.5 w-2.5",
    },
    md: {
      wrapper: "h-11 w-11",
      ring: "border-2",
      dot: "h-2 w-2",
    },
    sm: {
      wrapper: "h-5 w-5",
      ring: "border-2",
      dot: "h-1.5 w-1.5",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        classes.wrapper
      )}
      role="status"
      aria-label="Loading"
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full border-white/15",
          classes.ring
        )}
      />
      <span
        className={cn(
          "absolute inset-0 animate-spin rounded-full border-transparent border-t-[#8b9cf7] border-r-[#667eea]",
          classes.ring
        )}
      />
      <span
        className={cn(
          "rounded-full bg-white shadow-[0_0_18px_rgba(139,156,247,0.75)]",
          classes.dot
        )}
      />
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default LoadingSpinner;
