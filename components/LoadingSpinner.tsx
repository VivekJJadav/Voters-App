import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size: "sm" | "md" | "lg";
}

const LoadingSpinner = ({ size }: LoadingSpinnerProps) => {
  const sizeClasses = {
    lg: "h-80 w-80",
    md: "h-14 w-14",
    sm: "h-7 w-7",
  };

  return (
    <div className={cn("relative", sizeClasses[size])}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={cn("rounded-full object-cover", sizeClasses[size])}
      >
        <source src="/loading.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default LoadingSpinner;
