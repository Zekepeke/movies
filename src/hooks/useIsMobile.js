import { useEffect, useState } from "react";

// Reactive viewport hook. Returns true below the breakpoint.
export function useIsMobile(breakpoint = 640) {
  const [m, setM] = useState(
    typeof window !== "undefined" && window.innerWidth < breakpoint
  );
  useEffect(() => {
    const onResize = () => setM(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return m;
}
