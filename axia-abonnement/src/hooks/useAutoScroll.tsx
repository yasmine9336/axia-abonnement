import { useEffect, useRef } from "react";

export function useAutoScroll(dep: unknown) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dep]);
  return bottomRef;
}
