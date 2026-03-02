import { useEffect, RefObject } from "react";

export function useClickOutside(refs: RefObject<any>[], callback: () => void) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => !ref.current || !ref.current.contains(event.target as Node),
      );

      if (isOutside && refs.some((ref) => ref.current)) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [refs, callback]);
}
