import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size: string;
}

const LoadingSpinner = (size: LoadingSpinnerProps) => {
    const lg = size.size === "lg";
    const md = size.size === "md";
    const sm = size.size === "sm";

  return (
    <div
      className={cn(
        lg && "border-gray-300 h-20 w-20 animate-spin rounded-full border-8 border-t-blue-600",
        md && "border-gray-300 h-14 w-14 animate-spin rounded-full border-4 border-t-blue-600",
        sm && "border-gray-300 h-7 w-7 animate-spin rounded-full border-2 border-t-blue-600",
      )}
    />
  );
};

export default LoadingSpinner;
