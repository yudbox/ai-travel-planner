import { useEffect } from "react";

/**
 * Auto-hide a message after specified delay
 * @param message - Current message value
 * @param onClear - Callback to clear the message
 * @param delay - Delay in milliseconds (default: 5000)
 */
export function useAutoHide(
  message: string,
  onClear: () => void,
  delay: number = 5000,
) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClear();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [message, onClear, delay]);
}
