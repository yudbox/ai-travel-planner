import * as React from "react";
import { cn } from "@/lib/utils";

export interface TabsProps {
  tabs: Array<{
    value: string;
    label: string;
    icon?: string;
  }>;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onValueChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        "flex gap-4 border-b border-gray-200 dark:border-gray-700",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            "px-4 py-2 font-medium transition-colors",
            value === tab.value
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200",
          )}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
