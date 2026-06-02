import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Activity,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Shield,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface CompanyDashboardProps {
  units: UnitIntelligence[];
  onAddUnit: () => void;
  onSelectUnit: (unit: UnitIntelligence) => void;
}

const RISK_CONFIG: Record<EnvironmentalRisk, { label: string; color: string; bg: string; border: string; icon: typeof ShieldCheck }> = {
  [EnvironmentalRisk.LOW]: {
    label: 'Baixo Risco',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: ShieldCheck,
  },
  [EnvironmentalRisk.MEDIUM]: {
    label: 'Risco Médio',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Shield,
  },
  [EnvironmentalRisk.HIGH]: {
    label: 'Alto Risco',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    icon: ShieldAlert,
  },
  [EnvironmentalRisk.CRITICAL]: {
    label: 'Crítico',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: ShieldAlert,
  },
};

export function CompanyDashboard({ units, onAddUnit, onSelectUnit }: CompanyDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<EnvironmentalRisk | 'all'>('all');

  const filtered = units.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || u.risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const avgScore = Math.round(units.reduce((acc, u) => acc + u.currentScore, 0) / (units.length || 1));
  const criticalCount = units.filter((u) => u.risk === EnvironmentalRisk.CRITICAL || u.risk === EnvironmentalRisk.HIGH).length;
  const totalAlerts = units.reduce((acc, u) => acc + u.alerts.length, 0);

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Empresas Monitoradas</h1>
          <p className="text-sm text-slate-400">Gestão territorial e inteligência ambiental</p>
        </div>
        <button
          onClick={onAddUnit}
          className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={16} />
          Nova Empresa
        </button>
      </header>

      {/* Métricas */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Unidades', value: units.length, sub: 'mapeadas', icon: Building2, color: 'text-emerald-400' },
          { label: 'Score Médio', value: `${avgScore}/100`, sub: avgScore >= 70 ? 'Bom' : avgScore >= 50 ? 'Atenção' : 'Crítico', icon: Activity, color: avgScore >= 70 ? 'text-emerald-400' : avgScore >= 50 ? 'text-amber-400' : 'text-red-400' },
          { label: 'Alto Risco', value: criticalCount, sub: 'unidades', icon: ShieldAlert, color: criticalCount > 0 ? 'text-red-400' : 'text-emerald-400' },
          { label: 'Alertas Ativos', value: totalAlerts, sub: 'ocorrências', icon: Activity, color: totalAlerts > 0 ? 'text-amber-400' : 'text-emerald-400' },
        ].map((metric, i) => (
          <GlassCard key={i} className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center border', metric.color, 'bg-white/5 border-white/10')}>
              <metric.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{metric.label}</p>
              <p className={cn('text-xl font-bold mt-0.5', metric.color)}>{metric.value}</p>
              <p className="text-[10px] text-slate-600 font-mono">{metric.sub}</p>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* Filtros */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative group flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar empresa..."
            className="w-full pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', ...Object.values(EnvironmentalRisk)] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setFilterRisk(risk)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
                filterRisk === risk
                  ? risk === 'all'
                    ? 'bg-white/10 border-white/20 text-white'
                    : cn(RISK_CONFIG[risk as EnvironmentalRisk].bg, RISK_CONFIG[risk as EnvironmentalRisk].border, RISK_CONFIG[risk as EnvironmentalRisk].color)
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
              )}
            >
              {risk === 'all' ? 'Todos' : RISK_CONFIG[risk as EnvironmentalRisk].label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Empresas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            {filtered.length} empresa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4 text-slate-600"
            >
              <Building2 size={40} />
              <p className="text-xs font-mono uppercase tracking-widest">Nenhuma empresa encontrada</p>
              <button
                onClick={onAddUnit}
                className="text-emerald-400 text-xs font-mono hover:underline uppercase tracking-widest"
              >
                + Cadastrar nova empresa
              </button>
            </motion.div>
          ) : (
            filtered.map((unit, i) => {
              const risk = RISK_CONFIG[unit.risk];
              const RiskIcon = risk.icon;
              const scoreColor =
                unit.currentScore >= 70
                  ? 'text-emerald-400'
                  : unit.currentScore >= 50
                  ? 'text-amber-400'
                  : 'text-red-400';

              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-emerald-500/20 rounded-2xl transition-all group cursor-pointer"
                  onClick={() => onSelectUnit(unit)}
                >
                  {/* Left */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 border border-white/10 group-hover:border-emerald-500/20 flex items-center justify-center transition-all shrink-0">
                      <Building2 size={24} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                        {unit.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MapPin size={10} className="text-slate-600 shrink-0" />
                        <p className="text-[10px] text-slate-500 font-mono">{unit.address}</p>
                      </div>
                      {unit.alerts.length > 0 && (
                        <p className="text-[9px] text-amber-400 font-mono mt-1">
                          ⚠ {unit.alerts.length} alerta{unit.alerts.length !== 1 ? 's' : ''} ativo{unit.alerts.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-8 shrink-0">
                    {/* Score */}
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Score Ambiental</p>
                      <p className={cn('text-2xl font-bold font-mono mt-0.5', scoreColor)}>
                        {unit.currentScore}
                        <span className="text-xs text-slate-600">/100</span>
                      </p>
                    </div>

                    {/* Coordenadas */}
                    <div className="text-right hidden lg:block">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Coordenadas</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {unit.lat.toFixed(4)}, {unit.lng.toFixed(4)}
                      </p>
                    </div>

                    {/* Risco */}
                    <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg border', risk.bg, risk.border)}>
                      <RiskIcon size={12} className={risk.color} />
                      <span className={cn('text-[9px] font-bold uppercase tracking-widest', risk.color)}>
                        {risk.label}
                      </span>
                    </div>

                    <ChevronRight size={16} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
