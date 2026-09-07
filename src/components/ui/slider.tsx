import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-[#2C253E] shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#8ECDF6] to-[#A9D8FC] dark:from-[#4E98CC] dark:to-[#6FB4E6]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-white dark:bg-[#F3EEFF] border border-black/5 dark:border-white/15 shadow-[0_4px_10px_rgba(0,0,0,0.25),inset_0_2px_3px_rgba(255,255,255,0.95)] ring-0 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
