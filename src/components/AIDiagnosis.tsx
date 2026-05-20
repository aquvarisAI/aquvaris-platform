import { BrainCircuit, AlertTriangle, Droplets } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";

interface AIDiagnosisProps {
  diagnostic?: string | null;
  onExecute?: () => void;
  loading?: boolean;
}

export function AIDiagnosis({ diagnostic, onExecute, loading }: AIDiagnosisProps) {
  return (
    <GlassCard className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <BrainCircuit className="text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Diagnóstico Inteligente</h2>
            <p className="text-xs text-slate-400">Gerado com base nas evidências da vistoria</p>
          </div>
        </div>
        {onExecute && (
          <button 
            onClick={onExecute}
            disabled={loading}
            className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Atualizar'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <span className="rounded-full bg-red-500/10 px-3 py-1 text-[9px] font-mono uppercase text-red-400 border border-red-500/20 tracking-tighter">
          Consumo anômalo
        </span>
        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[9px] font-mono uppercase text-yellow-400 border border-yellow-500/20 tracking-tighter">
          Possível vazamento
        </span>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[9px] font-mono uppercase text-emerald-400 border border-emerald-500/20 tracking-tighter">
          Evidência operacional
        </span>
      </div>

      <div className="space-y-4 text-sm text-slate-300 flex-1 overflow-y-auto pr-2 scrollbar-hide">
        {diagnostic ? (
          <div className="rounded-xl bg-white/5 p-4 border border-white/5">
             <p className="text-xs leading-relaxed italic text-gray-300">"{diagnostic}"</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 p-4 border border-white/5">
            <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
              <AlertTriangle size={18} />
              Anomalia detectada
            </div>
            <p className="text-xs">
              O padrão de consumo noturno apresenta comportamento incompatível com operação encerrada.
            </p>
          </div>
        )}

        <div className="rounded-xl bg-white/5 p-4 border border-white/5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
            <Droplets size={18} />
            Recomendação técnica
          </div>
          <p className="text-xs">
            Realizar teste de estanqueidade nos setores de produção, sanitários e refrigeração.
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-between items-center text-xs pt-4 border-t border-white/5">
        <span className="text-slate-500 font-mono uppercase tracking-widest text-[9px]">Confiança da IA</span>
        <span className="text-emerald-400 font-bold font-mono">94%</span>
      </div>
    </GlassCard>
  );
}
