import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] dark:from-[#FF9C87] dark:to-[#F57256] text-white shadow-[0_4px_10px_rgba(255,105,75,0.3),inset_0_2px_3px_rgba(255,255,255,0.7)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.4)]",
        secondary:
          "border-transparent bg-gradient-to-b from-[#D4C4FF] to-[#B89FFF] dark:from-[#C7B5FF] dark:to-[#A58BFF] text-[#241D3B] dark:text-[#1F1538] shadow-[0_4px_10px_rgba(130,95,230,0.25),inset_0_2px_3px_rgba(255,255,255,0.8)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.4)]",
        destructive:
          "border-transparent bg-gradient-to-b from-[#FF97A8] to-[#FF6B82] dark:from-[#FFA3B2] dark:to-[#F75971] text-white shadow-[0_4px_10px_rgba(255,107,130,0.3)] dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)]",
        outline: "text-foreground border-border bg-card shadow-sm",
        clayActive:
          "border-transparent bg-gradient-to-b from-[#B2EFE2] to-[#83E0C8] dark:from-[#7FE0C7] dark:to-[#46CCA8] text-[#0C4335] dark:text-[#06281E] shadow-[0_4px_12px_rgba(70,190,155,0.28),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(20,110,85,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_3px_rgba(0,0,0,0.3)]",
        clayPending:
          "border-transparent bg-gradient-to-b from-[#FFEB9C] to-[#FFDB68] dark:from-[#FFE07D] dark:to-[#F5C53D] text-[#4A3403] dark:text-[#382402] shadow-[0_4px_12px_rgba(225,170,30,0.25),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(140,90,10,0.18)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_3px_rgba(0,0,0,0.3)]",
        clayArchived:
          "border-transparent bg-gradient-to-b from-[#DDD0FF] to-[#C3AEFF] dark:from-[#C7B5FF] dark:to-[#A58BFF] text-[#2E234D] dark:text-[#1F1538] shadow-[0_4px_12px_rgba(135,100,230,0.28),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(80,50,160,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_3px_rgba(0,0,0,0.3)]",
        clayPeach:
          "border-transparent bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] dark:from-[#FF9C87] dark:to-[#F57256] text-white shadow-[0_4px_12px_rgba(255,105,75,0.3),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(160,45,15,0.2)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.5),inset_0_-2px_3px_rgba(0,0,0,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  dot?: boolean;
  dotColor?: string;
}

function Badge({ className, variant, dot, dotColor, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-2 w-2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8)]",
            dotColor ||
              (variant === "clayActive"
                ? "bg-[#10B981]"
                : variant === "clayPending"
                  ? "bg-[#F59E0B]"
                  : variant === "clayArchived"
                    ? "bg-[#8B5CF6]"
                    : "bg-white"),
          )}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
