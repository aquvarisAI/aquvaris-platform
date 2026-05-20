import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Activity, 
  Clock, 
  Sparkles,
  Search as SearchIcon,
  Filter as FilterIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, TechnicalSurvey, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface SurveyDashboardProps {
  units: UnitIntelligence[];
  onStartSurvey: (unit: UnitIntelligence) => void;
}

export function SurveyDashboard({ units, onStartSurvey }: SurveyDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vistoria Inteligente</h1>
          <p className="text-sm text-slate-400">
            Gerenciamento de protocolos e auditoria ambiental IA
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Pesquisar unidade..."
              className="pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none w-64 transition-all placeholder:text-gray-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
            <FilterIcon size={18} />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="flex items-center gap-6 group hover:border-emerald-500/30 transition-all cursor-pointer">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Plus size={28} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Novo Protocolo</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">INICIAR COLETA EM CAMPO</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <Activity size={28} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Em Análise IA</h3>
            <p className="text-7xl absolute -right-4 -bottom-4 opacity-5 font-bold">12</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">PROCESSAMENTO DE EVIDÊNCIAS</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Clock size={28} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white">Pendentes</h3>
            <p className="text-7xl absolute -right-4 -bottom-4 opacity-5 font-bold">08</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">AGUARDANDO FINALIZAÇÃO</p>
          </div>
        </GlassCard>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Unidades Disponíveis para Auditoria</h2>
          <span className="text-[10px] font-mono text-emerald-400">{filteredUnits.length} UNIDADES MAPEADAS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <GlassCard 
              key={unit.id}
              className="group hover:border-emerald-500/30 transition-all flex flex-col justify-between h-48"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                    <Building2Icon size={20} className="text-slate-400 group-hover:text-emerald-400" />
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded-[4px] text-[8px] font-mono uppercase tracking-widest border",
                    unit.risk === EnvironmentalRisk.LOW ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    unit.risk === EnvironmentalRisk.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                  )}>
                    {unit.risk} risk
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors uppercase truncate">{unit.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{unit.address}</p>
                </div>
              </div>

              <button 
                onClick={() => onStartSurvey(unit)}
                className="w-full mt-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-emerald-500 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all border border-white/5 group-hover:border-emerald-500/20"
              >
                Iniciar Protocolo
                <ChevronRight size={14} />
              </button>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-4 pb-10">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Protocolos Recentes</h2>
          <button className="text-[10px] font-mono text-emerald-400 hover:underline">VER HISTÓRICO COMPLETO</button>
        </div>

        <div className="space-y-2">
          {[
            { tag: "VST-2024-0812", unit: "Industrial Park Alpha", date: "Hoje, 10:45", status: "Processado IA", score: "42/100" },
            { tag: "VST-2024-0811", unit: "Logistics Hub Beta", date: "Ontem, 16:20", status: "Finalizado", score: "88/100" },
            { tag: "VST-2024-0809", unit: "Business Center Gamma", date: "05 Mai", status: "Em Revisão", score: "65/100" },
          ].map((survey, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all group">
              <div className="flex items-center gap-6">
                 <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 font-mono text-[10px]">
                    {i+1}
                 </div>
                 <div>
                    <p className="text-xs font-bold text-white uppercase tracking-tight">{survey.unit}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{survey.tag} — {survey.date}</p>
                 </div>
              </div>
              <div className="flex items-center gap-10">
                 <div className="text-right">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Nível de Eficiência</p>
                    <p className="text-sm font-bold text-emerald-400">{survey.score}</p>
                 </div>
                 <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                    {survey.status}
                 </div>
                 <button className="p-2 text-slate-500 hover:text-white transition-colors">
                    <ChevronRight size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Building2Icon({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M8 10h.01" />
      <path d="M16 10h.01" />
      <path d="M8 14h.01" />
      <path d="M16 14h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
    </svg>
  );
}
