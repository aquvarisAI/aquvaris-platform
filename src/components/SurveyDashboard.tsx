import React, { useState } from 'react';
import { 
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus, 
  ChevronRight, 
  Activity, 
  Clock, 
  X,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface SurveyDashboardProps {
  units: UnitIntelligence[];
  onStartSurvey: (unit: UnitIntelligence) => void;
}

type FilterType = 'all' | 'processing' | 'pending';

const MOCK_INSPECTIONS = [
  { tag: "VST-2024-0812", unit: "Parque Industrial Alfa", date: "Hoje, 10:45", status: "processing", score: "42/100" },
  { tag: "VST-2024-0811", unit: "Centro Logístico Beta", date: "Ontem, 16:20", status: "completed", score: "88/100" },
  { tag: "VST-2024-0809", unit: "Centro de Negócios Gama", date: "05 Mai", status: "pending", score: "65/100" },
  { tag: "VST-2024-0808", unit: "Parque Industrial Alfa", date: "04 Mai", status: "pending", score: "--/100" },
  { tag: "VST-2024-0805", unit: "Centro Logístico Beta", date: "02 Mai", status: "processing", score: "71/100" },
];

const STATUS_LABELS: Record<string, string> = {
  processing: "Em Análise IA",
  completed: "Finalizado",
  pending: "Pendente",
};

const STATUS_COLORS: Record<string, string> = {
  processing: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  completed: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pending: "bg-amber-500/10 border-amber-500/20 text-amber-400",
};

export function SurveyDashboard({ units, onStartSurvey }: SurveyDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);

  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInspections = MOCK_INSPECTIONS.filter((inspection) => {
    if (filter === 'processing') return inspection.status === 'processing';
    if (filter === 'pending') return inspection.status === 'pending';
    return true;
  });

  const processingCount = MOCK_INSPECTIONS.filter(i => i.status === 'processing').length;
  const pendingCount = MOCK_INSPECTIONS.filter(i => i.status === 'pending').length;

  const handleSelectUnit = (unit: UnitIntelligence) => {
    setIsUnitModalOpen(false);
    onStartSurvey(unit);
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vistoria Inteligente</h1>
            <p className="text-sm text-slate-400">
              Gerenciamento de protocolos e auditorias ambientais IA
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Pesquisar território..."
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

        {/* Status Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Novo Protocolo */}
          <GlassCard 
            onClick={() => setIsUnitModalOpen(true)}
            className="flex items-center gap-6 group hover:border-emerald-500/30 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <Plus size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Novo Protocolo</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">INICIAR COLETA EM CAMPO</p>
            </div>
          </GlassCard>

          {/* Em Análise IA */}
          <GlassCard 
            onClick={() => setFilter(filter === 'processing' ? 'all' : 'processing')}
            className={cn(
              "flex items-center gap-6 relative overflow-hidden cursor-pointer transition-all",
              filter === 'processing' ? 'border-blue-500/40 bg-blue-500/5' : 'hover:border-blue-500/20'
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
              filter === 'processing' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            )}>
              <Activity size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Em Análise IA</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">PROCESSAMENTO DE EVIDÊNCIAS</p>
              {filter === 'processing' && (
                <p className="text-[9px] text-blue-400 font-mono mt-1">● FILTRO ATIVO</p>
              )}
            </div>
            <p className="text-7xl absolute -right-4 -bottom-4 opacity-5 font-bold">{processingCount}</p>
          </GlassCard>

          {/* Pendentes */}
          <GlassCard 
            onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
            className={cn(
              "flex items-center gap-6 relative overflow-hidden cursor-pointer transition-all",
              filter === 'pending' ? 'border-amber-500/40 bg-amber-500/5' : 'hover:border-amber-500/20'
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
              filter === 'pending' 
                ? 'bg-amber-500 text-white border-amber-500' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            )}>
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white">Pendentes</h3>
              <p className="text-[10px] text-slate-500 font-mono mt-1">AGUARDANDO FINALIZAÇÃO</p>
              {filter === 'pending' && (
                <p className="text-[9px] text-amber-400 font-mono mt-1">● FILTRO ATIVO</p>
              )}
            </div>
            <p className="text-7xl absolute -right-4 -bottom-4 opacity-5 font-bold">{pendingCount}</p>
          </GlassCard>
        </section>

        {/* Unidades */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Unidades Disponíveis para Auditório</h2>
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
                      {unit.risk === EnvironmentalRisk.LOW ? 'Baixo Risco' : 
                       unit.risk === EnvironmentalRisk.MEDIUM ? 'Risco Médio' : 'Alto Risco'}
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

        {/* Protocolos Recentes */}
        <section className="space-y-4 pb-10">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Protocolos Recentes</h2>
              {filter !== 'all' && (
                <span className={cn(
                  "text-[9px] font-mono px-2 py-0.5 rounded border uppercase tracking-widest",
                  filter === 'processing' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' : 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                )}>
                  {filter === 'processing' ? 'Em Análise IA' : 'Pendentes'} — {filteredInspections.length} resultado{filteredInspections.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button 
              onClick={() => setFilter('all')}
              className="text-[10px] font-mono text-emerald-400 hover:underline"
            >
              {filter !== 'all' ? 'LIMPAR FILTRO' : 'VER HISTÓRICO COMPLETO'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              {filteredInspections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-600 gap-3">
                  <CheckCircle2 size={32} />
                  <p className="text-xs font-mono uppercase tracking-widest">Nenhum protocolo encontrado</p>
                </div>
              ) : (
                filteredInspections.map((survey, i) => (
                  <motion.div
                    key={survey.tag}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 font-mono text-[10px]">
                        {i + 1}
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
                      <div className={cn(
                        "px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                        STATUS_COLORS[survey.status]
                      )}>
                        {STATUS_LABELS[survey.status]}
                      </div>
                      <button className="p-2 text-slate-500 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {/* Modal: Selecionar Unidade */}
      <AnimatePresence>
        {isUnitModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#080C14]/90 backdrop-blur-md"
            onClick={() => setIsUnitModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1118] w-full max-w-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.2em]">Selecionar Unidade</h2>
                  <p className="text-[10px] font-mono text-slate-500 mt-1">ESCOLHA O TERRITÓRIO PARA AUDITORIA</p>
                </div>
                <button
                  onClick={() => setIsUnitModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {units.map((unit) => (
                  <motion.button
                    key={unit.id}
                    whileHover={{ x: 4 }}
                    onClick={() => handleSelectUnit(unit)}
                    className="w-full flex items-center gap-5 p-5 bg-white/[0.02] hover:bg-emerald-500/5 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 border border-white/10 group-hover:border-emerald-500/20 flex items-center justify-center transition-all">
                      <Building2Icon size={20} className="text-slate-400 group-hover:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold uppercase tracking-tight text-white group-hover:text-emerald-400 transition-colors truncate">{unit.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin size={10} className="text-slate-600 shrink-0" />
                        <p className="text-[10px] text-slate-500 font-mono truncate">{unit.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-mono uppercase tracking-widest border",
                        unit.risk === EnvironmentalRisk.LOW ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        unit.risk === EnvironmentalRisk.MEDIUM ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      )}>
                        {unit.risk === EnvironmentalRisk.LOW ? 'Baixo' : 
                         unit.risk === EnvironmentalRisk.MEDIUM ? 'Médio' : 'Alto'}
                      </div>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-4 border-t border-white/5 bg-[#080C14]/40">
                <p className="text-[10px] font-mono text-slate-600 text-center uppercase tracking-widest">
                  {units.length} unidade{units.length !== 1 ? 's' : ''} disponível{units.length !== 1 ? 'eis' : ''} para auditoria
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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