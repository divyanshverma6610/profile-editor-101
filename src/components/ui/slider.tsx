"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Slider = forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-5 w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-px w-full grow overflow-visible rounded-full bg-[#E5E5E5]">
      <SliderPrimitive.Range className="absolute h-px bg-[#0A0A0A]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-label="value"
      className="block h-3.5 w-3.5 cursor-pointer rounded-full border border-[#0A0A0A] bg-white outline-none transition-colors duration-200 hover:bg-[#0A0A0A] focus-visible:bg-[#0A0A0A] focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 disabled:pointer-events-none"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

export { Slider };
