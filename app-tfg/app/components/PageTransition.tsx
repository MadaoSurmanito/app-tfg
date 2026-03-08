"use client";

import { useEffect, useState } from "react";

type PageTransitionProps = {
  children: React.ReactNode;
  isLeaving?: boolean;
  className?: string;
};

export default function PageTransition({
  children,
  isLeaving = false,
  className = "",
}: PageTransitionProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        isLeaving
          ? "opacity-0 scale-95"
          : entered
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
}