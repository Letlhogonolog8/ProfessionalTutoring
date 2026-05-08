import { cn } from "@/lib/utils";
import kindleahLogo from "@/assets/kindleah-logo.png";

export function KindleahLogo({ className, size = "default" }: { className?: string, size?: "default" | "small" | "large" }) {
  const sizeClasses = {
    small: "h-8",
    default: "h-10",
    large: "h-16"
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <img 
          src={kindleahLogo} 
          alt="Kindleah Investment Logo" 
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
}
