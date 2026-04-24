import type { ReactNode } from "react";

interface UiCardProps {
  children: ReactNode;
  className?: string;
}

export default function UiCard({ children, className = "" }: UiCardProps) {
  return <div className={`ui-card ${className}`}>{children}</div>;
}