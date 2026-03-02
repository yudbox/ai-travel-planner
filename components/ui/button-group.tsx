import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupOption {
  value: string;
  label: string;
  icon?: string;
}

export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  helperText?: string;
  multiSelect?: boolean;
  className?: string;
}

export function ButtonGroup({
  options,
  value,
  onChange,
  label,
  helperText,
  multiSelect = true,
  className,
}: ButtonGroupProps) {
  const handleClick = (optionValue: string) => {
    if (multiSelect) {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    } else {
      onChange([optionValue]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className={cn("flex flex-wrap gap-2", className)}>
        {options.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isSelected
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700",
              )}
            >
              {option.icon && <span className="mr-1">{option.icon}</span>}
              {option.label}
            </button>
          );
        })}
      </div>
      {helperText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}
