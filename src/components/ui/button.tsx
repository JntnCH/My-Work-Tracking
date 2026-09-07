import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] dark:from-[#FF9C87] dark:to-[#F57256] text-white shadow-[0_8px_20px_-2px_rgba(255,105,75,0.42),inset_0_3px_4px_rgba(255,255,255,0.75),inset_0_-3px_6px_rgba(160,45,15,0.22)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.4)] hover:brightness-105 active:shadow-[0_4px_12px_rgba(255,105,75,0.35),inset_0_2px_4px_rgba(0,0,0,0.15)]",
        destructive:
          "bg-gradient-to-b from-[#FF97A8] to-[#FF6B82] dark:from-[#FFA3B2] dark:to-[#F75971] text-white shadow-[0_8px_20px_-2px_rgba(255,107,130,0.42),inset_0_3px_4px_rgba(255,255,255,0.75),inset_0_-3px_6px_rgba(160,25,45,0.22)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.4)] hover:brightness-105",
        outline:
          "border border-border/80 bg-card text-foreground shadow-[0_4px_12px_-2px_rgba(100,90,140,0.08),inset_0_2px_3px_rgba(255,255,255,0.9)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4),inset_0_2px_3px_rgba(255,255,255,0.12)] hover:bg-accent/40",
        secondary:
          "bg-gradient-to-b from-[#D4C4FF] to-[#B89FFF] dark:from-[#C7B5FF] dark:to-[#A58BFF] text-[#241D3B] dark:text-[#1F1538] shadow-[0_8px_20px_-2px_rgba(130,95,230,0.35),inset_0_3px_4px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(80,50,160,0.2)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35)] hover:brightness-105",
        ghost: "hover:bg-accent/50 text-foreground",
        link: "text-primary underline-offset-4 hover:underline rounded-none",
        clayPeach:
          "bg-gradient-to-b from-[#FFAE9B] to-[#FF856A] dark:from-[#FF9C87] dark:to-[#F57256] text-white shadow-[0_8px_22px_-2px_rgba(255,105,75,0.45),inset_0_3px_4px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(160,45,15,0.22)] dark:shadow-[0_8px_22px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.4),inset_0_-3px_6px_rgba(0,0,0,0.4)] hover:brightness-105",
        clayPurple:
          "bg-gradient-to-b from-[#D4C4FF] to-[#B89FFF] dark:from-[#C7B5FF] dark:to-[#A58BFF] text-[#241D3B] dark:text-[#1F1538] shadow-[0_8px_20px_-2px_rgba(130,95,230,0.35),inset_0_3px_4px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(80,50,160,0.2)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35)] hover:brightness-105",
        clayMint:
          "bg-gradient-to-b from-[#A4EADB] to-[#70D8BD] dark:from-[#87E2C9] dark:to-[#51CCA9] text-[#0F382D] dark:text-[#08281E] shadow-[0_8px_20px_-2px_rgba(70,195,160,0.38),inset_0_3px_4px_rgba(255,255,255,0.8),inset_0_-3px_6px_rgba(25,120,90,0.2)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35)] hover:brightness-105",
        clayYellow:
          "bg-gradient-to-b from-[#FFE896] to-[#FFD65E] dark:from-[#FFE07D] dark:to-[#F5C53D] text-[#382A05] dark:text-[#2E2104] shadow-[0_8px_20px_-2px_rgba(230,175,40,0.35),inset_0_3px_4px_rgba(255,255,255,0.85),inset_0_-3px_6px_rgba(150,100,10,0.18)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35)] hover:brightness-105",
        clayBlue:
          "bg-gradient-to-b from-[#BFE3FB] to-[#8ECDF6] dark:from-[#9CD8FC] dark:to-[#63B8F2] text-[#0E2E4A] dark:text-[#092238] shadow-[0_8px_20px_-2px_rgba(90,170,230,0.35),inset_0_3px_4px_rgba(255,255,255,0.85),inset_0_-3px_6px_rgba(30,100,160,0.18)] dark:shadow-[0_8px_20px_-2px_rgba(0,0,0,0.5),inset_0_3px_4px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.35)] hover:brightness-105",
        clayWhite:
          "bg-white dark:bg-[#312944] text-[#2B2D42] dark:text-[#F7F6FC] shadow-[0_6px_16px_-2px_rgba(100,90,140,0.12),inset_0_2px_3px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.45),inset_0_2px_3px_rgba(255,255,255,0.15),inset_0_-2px_4px_rgba(0,0,0,0.35)] hover:bg-slate-50 dark:hover:bg-[#393050]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-full px-3.5 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
