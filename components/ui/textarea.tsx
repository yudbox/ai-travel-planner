import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "w-full rounded-md border bg-white dark:bg-gray-800 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
  {
    variants: {
      variant: {
        default:
          "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20",
        error:
          "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      label,
      error,
      helperText,
      showCount,
      maxLength,
      ...props
    },
    ref,
  ) => {
    const [count, setCount] = React.useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            textareaVariants({ variant: error ? "error" : variant, className }),
          )}
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          {...props}
        />
        <div className="flex justify-between">
          <div>
            {error && (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
            {!error && helperText && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {helperText}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {count}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
