"use client";

import { useEffect, useState } from "react";

type PageTransitionProps = {
  children: React.ReactNode;
  isLeaving?: boolean;
  className?: string;
};

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent;
  const platform = window.navigator.platform;

  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export default function PageTransition({
  children,
  isLeaving = false,
  className = "",
}: PageTransitionProps) {
  const [entered, setEntered] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(isIOSDevice());

    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  const baseTransition = isIOS
    ? "transition-opacity duration-500 ease-out"
    : "transition-all duration-500 ease-out";

  const transitionClass = isIOS
    ? isLeaving
      ? "opacity-0"
      : entered
      ? "opacity-100"
      : "opacity-0"
    : isLeaving
    ? "opacity-0 scale-95"
    : entered
    ? "opacity-100 scale-100 translate-y-0"
    : "opacity-0 scale-95 translate-y-4";

  return (
    <div className={`${baseTransition} ${transitionClass} ${className}`}>
      {children}
    </div>
  );
}