"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function GetComponentButton() {
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    setClicked(true);
    setTimeout(() => setClicked(false), 2000);
  }

  return (
    <Button
      size="lg"
      onClick={handleClick}
      aria-live="polite"
      className={cn(
        "group relative h-12 cursor-pointer rounded-xl px-8 text-base font-semibold tracking-tight shadow-lg transition-all duration-300",
        "bg-primary text-primary-foreground",
        "hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]",
        "focus-visible:ring-ring focus-visible:ring-[3px] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        clicked && "bg-chart-2 hover:bg-chart-2",
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2 transition-all duration-300",
          clicked && "gap-2.5",
        )}
      >
        {clicked ? (
          <>
            <Check className="size-5" aria-hidden="true" />
            <span>Added</span>
          </>
        ) : (
          <>
            <span>Get Component</span>
            <ArrowRight
              className="size-5 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </>
        )}
      </span>
      <span className="sr-only">
        {clicked
          ? "Component has been added successfully"
          : "Click to get the component"}
      </span>
    </Button>
  );
}
