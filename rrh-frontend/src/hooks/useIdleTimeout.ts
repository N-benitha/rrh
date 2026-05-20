import { useEffect, useRef, useState } from "react";

const IDLE_MS = 2 * 60 * 60 * 1000;   // 2 hours
const WARN_MS = 5 * 60 * 1000;         // warn 5 minutes before logout

const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

export function useIdleTimeout(onLogout: () => void) {
  const [showWarning, setShowWarning] = useState(false);
  const idleTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = () => {
    setShowWarning(false);

    if (idleTimer.current)  clearTimeout(idleTimer.current);
    if (warnTimer.current)  clearTimeout(warnTimer.current);

    warnTimer.current = setTimeout(() => setShowWarning(true), IDLE_MS - WARN_MS);
    idleTimer.current = setTimeout(() => onLogout(), IDLE_MS);
  };

  useEffect(() => {
    reset();
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      if (idleTimer.current)  clearTimeout(idleTimer.current);
      if (warnTimer.current)  clearTimeout(warnTimer.current);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  return { showWarning, resetTimer: reset };
}
