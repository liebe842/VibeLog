import { cn } from "@/lib/utils";
import React from "react";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size = "md", fallback, src, alt, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative inline-block overflow-hidden rounded-full bg-surface-dark border border-border-dark",
          sizeClasses[size],
          className
        )}
      >
        {src ? (
          <img
            ref={ref}
            src={src}
            alt={alt || "Avatar"}
            className="h-full w-full object-cover"
            {...props}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface-dark text-text-secondary font-semibold">
            {fallback || "?"}
          </div>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar };
