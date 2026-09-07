import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] text-white shadow-[0_4px_10px_rgba(255,105,75,0.3),inset_0_2px_3px_rgba(255,255,255,0.7)]",
        secondary:
          "border-transparent bg-gradient-to-b from-[#D4C4FF] to-[#B89FFF] text-[#241D3B] shadow-[0_4px_10px_rgba(130,95,230,0.25),inset_0_2px_3px_rgba(255,255,255,0.8)]",
        destructive:
          "border-transparent bg-gradient-to-b from-[#FF97A8] to-[#FF6B82] text-white shadow-[0_4px_10px_rgba(255,107,130,0.3)]",
        outline: "text-foreground border-border bg-card shadow-sm",
        clayActive:
          "border-transparent bg-gradient-to-b from-[#B2EFE2] to-[#83E0C8] text-[#0C4335] shadow-[0_4px_12px_rgba(70,190,155,0.28),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(20,110,85,0.2)]",
        clayPending:
          "border-transparent bg-gradient-to-b from-[#FFEB9C] to-[#FFDB68] text-[#4A3403] shadow-[0_4px_12px_rgba(225,170,30,0.25),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(140,90,10,0.18)]",
        clayArchived:
          "border-transparent bg-gradient-to-b from-[#DDD0FF] to-[#C3AEFF] text-[#2E234D] shadow-[0_4px_12px_rgba(135,100,230,0.28),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(80,50,160,0.2)]",
        clayPeach:
          "border-transparent bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] text-white shadow-[0_4px_12px_rgba(255,105,75,0.3),inset_0_2px_3px_#ffffff,inset_0_-2px_3px_rgba(160,45,15,0.2)]",
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
