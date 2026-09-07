"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

interface ModuleDetailLayoutLayoutProps {
  children: ReactNode;
}

// Used to force rerender on every nav
export default function ModuleDetailLayout({ children }: ModuleDetailLayoutLayoutProps) {
  const searchParams = useSearchParams();
  const refreshKey = searchParams.get("r") || "initial";

  return <div key={refreshKey}>{children}</div>;
}
