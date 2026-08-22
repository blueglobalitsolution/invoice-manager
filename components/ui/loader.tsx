import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "fading-ring" | "default";
  size?: number;
}

export function Loader({ className, variant = "default", size = 24, ...props }: LoaderProps) {
  if (variant === "fading-ring") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", className)}
        {...(props as any)}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
      {...(props as any)}
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" />
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
