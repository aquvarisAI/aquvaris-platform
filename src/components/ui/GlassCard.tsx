import { ReactNode, HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  key?: string | number;
}

export function GlassCard({ children, className = "", ...props }: GlassCardProps) {
  return (
    <div
      {...props}
      className={`
        rounded-2xl border border-emerald-500/10
        bg-[#06141A]/80 backdrop-blur-xl
        shadow-[0_0_30px_rgba(16,185,129,0.10)]
        p-5
        ${className}
      `}
    >
      {children}
    </div>
  );
}
