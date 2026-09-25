"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Switch = forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-[#0A0A0A]/20 bg-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A]/20 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[#0A0A0A] data-[state=checked]:bg-[#0A0A0A]",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-3.5 w-3.5 translate-x-[3px] rounded-full bg-[#0A0A0A] transition-transform duration-200 data-[state=checked]:translate-x-[19px] data-[state=checked]:bg-white" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
