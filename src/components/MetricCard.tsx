import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";

interface MetricCardProps {
  title: string;
  value: string;
  status: string;
  trend?: "up" | "down";
  alert?: boolean;
}

export function MetricCard({ title, value, status, trend = "up", alert = false }: MetricCardProps) {
  return (
    <GlassCard className="min-h-[130px]">
      <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">{title}</p>

      <div className="mt-4 flex items-end justify-between">
        <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>

        {trend === "up" ? (
          <ArrowUpRight className="text-emerald-400" size={22} />
        ) : (
          <ArrowDownRight className="text-red-400" size={22} />
        )}
      </div>

      <p className={`mt-3 text-xs font-medium ${alert ? "text-red-400" : "text-emerald-400"}`}>
        {status}
      </p>
    </GlassCard>
  );
}
