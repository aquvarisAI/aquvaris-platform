import { MapPin } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";

const points = [
  { x: "18%", y: "32%", color: "text-emerald-400" },
  { x: "35%", y: "52%", color: "text-yellow-400" },
  { x: "48%", y: "38%", color: "text-red-400" },
  { x: "62%", y: "58%", color: "text-cyan-400" },
  { x: "78%", y: "30%", color: "text-emerald-400" },
  { x: "84%", y: "65%", color: "text-orange-400" },
];

export function EnvironmentalMap() {
  return (
    <GlassCard className="relative h-[360px] overflow-hidden">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">Mapa de Risco Ambiental</h2>
        <p className="text-sm text-slate-400">Empresas monitoradas por nível de risco</p>
      </div>

      <div className="relative h-[270px] rounded-xl bg-[#020A0E] overflow-hidden border border-white/5">
        {/* Grid dots/lines */}
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,#10b98122_1px,transparent_1px),linear-gradient(to_bottom,#10b98122_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Glow center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />

        {points.map((point, index) => (
          <MapPin
            key={index}
            className={`absolute ${point.color} drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse transition-all hover:scale-125 cursor-pointer`}
            style={{ left: point.x, top: point.y }}
            size={30}
          />
        ))}

        <div className="absolute bottom-4 right-4 rounded-xl bg-black/50 backdrop-blur-md p-3 text-[10px] font-mono text-slate-300 border border-white/10 space-y-1 uppercase tracking-tighter shrink-0">
          <p><span className="text-red-400 mr-2">●</span> Risco crítico</p>
          <p><span className="text-yellow-400 mr-2">●</span> Atenção</p>
          <p><span className="text-emerald-400 mr-2">●</span> Normal</p>
        </div>
      </div>
    </GlassCard>
  );
}
