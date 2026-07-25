"use client";

import { useEffect } from "react";

/** Reloads the page on an interval — used by /overlay so an OBS Browser Source stays fresh. */
export function AutoReload({ seconds }: { seconds: number }) {
  useEffect(() => {
    const timer = setInterval(() => location.reload(), seconds * 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  return null;
}
