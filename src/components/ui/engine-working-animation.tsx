import { Cog, Gauge, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type EngineWorkingAnimationProps = {
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  decorative?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "engine-working--sm",
  md: "engine-working--md",
  lg: "engine-working--lg",
} as const;

export function EngineWorkingAnimation({
  label = "กำลังทำงาน",
  size = "md",
  showLabel = false,
  decorative = false,
  className,
}: EngineWorkingAnimationProps) {
  return (
    <span
      className={cn("engine-working", sizeClasses[size], className)}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-live={decorative ? undefined : "polite"}
    >
      <span className="engine-working__visual" aria-hidden="true">
        <span className="engine-working__machine">
          <span className="engine-working__cylinder engine-working__cylinder--one" />
          <span className="engine-working__cylinder engine-working__cylinder--two" />
          <span className="engine-working__cylinder engine-working__cylinder--three" />
          <span className="engine-working__cylinder engine-working__cylinder--four" />
          <span className="engine-working__piston engine-working__piston--one" />
          <span className="engine-working__piston engine-working__piston--two" />
          <span className="engine-working__piston engine-working__piston--three" />
          <span className="engine-working__piston engine-working__piston--four" />
          <span className="engine-working__port" />
        </span>
        <Cog className="engine-working__gear engine-working__gear--back" />
        <Gauge className="engine-working__gauge" />
        <Zap className="engine-working__spark" />
        <span className="engine-working__exhaust">
          <i />
          <i />
          <i />
        </span>
      </span>
      {showLabel && <span className="engine-working__label">{label}</span>}
    </span>
  );
}
