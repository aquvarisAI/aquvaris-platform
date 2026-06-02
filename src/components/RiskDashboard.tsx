import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle, TrendingUp, Activity, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface RiskDashboardProps {
  units: UnitIntelligence[];
  onStartSurvey: (unit: UnitIntelligence) => void;
}

const RISK_CONFIG: Record<EnvironmentalRisk, { label: string; color: string; bg: string; border: string; icon: any; score: string }> = {
  [EnvironmentalRisk.LOW]: { label: 'Baixo', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: ShieldCheck, score: '80-100' },
  [EnvironmentalRisk.MEDIUM]: { label: 'Médio', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Shield, score: '60-79' },
  [EnvironmentalRisk.HIGH]: { label: 'Alto', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: ShieldAlert, score: '40-59' },
  [EnvironmentalRisk.CRITICAL]: { label: 'Crítico', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: ShieldAlert, score: '0-39' },
};

const RISK_SCENARIOS = [
  { title: 'Escassez Hídrica', probability: 72, impact: 85, category: 'Ambiental' },
  { title: 'Não Conformidade Regulatória', probability: 45, impact: 90, category: 'Legal' },
  { title: 'Contaminação de Solo', probability: 28, impact: 95, category: 'Ambiental' },
  { title: 'Emissões Acima do Limite', probability: 60, impact: 70, category: 'Climático' },
  { title: 'Descarte Irregular de Resíduos', probability: 35, impact: 80, category: 'Operacional' },
];

export function RiskDashboard({ units, onStartSurvey }: RiskDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitIntelligence | null>(null);

  const riskCounts = {
    [EnvironmentalRisk.CRITICAL]: units.filter(u => u.risk === EnvironmentalRisk.CRITICAL).length,
    [EnvironmentalRisk.HIGH]: units.filter(u => u.risk === EnvironmentalRisk.HIGH).length,
    [EnvironmentalRisk.MEDIUM]: units.filter(u => u.risk === EnvironmentalRisk.MEDIUM).length,
    [EnvironmentalRisk.LOW]: units.filter(u => u.risk === EnvironmentalRisk.LOW).length,
  };

  const totalAlerts = units.reduce((acc, u) => acc + u.alerts.length, 0);
  const avgScore = Math.round(units.reduce((acc, u) => acc + u.currentScore, 0) / (units.length || 1));

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Matriz de Riscos</h1>
        <p className="text-sm text-slate-400">Gestão de riscos ambientais e conformidade ESG</p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(EnvironmentalRisk).reverse().map((risk, i) => {
          const cfg = RISK_CONFIG[risk];
          const RiskIcon = cfg.icon;
          return (
            <motion.div key={risk} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className={cn('border', riskCounts[risk] > 0 ? cfg.border : 'border-white/5')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', cfg.bg)}>
                    <RiskIcon size={18} className={cfg.color} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Risco {cfg.label}</p>
                    <p className="text-[9px] font-mono text-slate-600">Score {cfg.score}</p>
                  </div>
                </div>
                <p className={cn('text-3xl font-bold font-mono', riskCounts[risk] > 0 ? cfg.color : 'text-slate-600')}>
                  {riskCounts[risk]}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">unidade{riskCounts[risk] !== 1 ? 's' : ''}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Lista de unidades por risco */}
        <GlassCard className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Unidades por Nível de Risco</h2>
          <div className="space-y-2">
            {[...units].sort((a, b) => a.currentScore - b.currentScore).map((unit) => {
              const cfg = RISK_CONFIG[unit.risk];
              const RiskIcon = cfg.icon;
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(selectedUnit?.id === unit.id ? null : unit)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                    selectedUnit?.id === unit.id ? cn(cfg.bg, cfg.border) : 'bg-white/5 border-white/5 hover:border-white/20'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', cfg.bg)}>
                    <RiskIcon size={18} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white uppercase truncate">{unit.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{unit.address}</p>
                    {unit.alerts.length > 0 && (
                      <p className="text-[9px] text-amber-400 font-mono mt-0.5">⚠ {unit.alerts.length} alerta{unit.alerts.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-xl font-bold font-mono', cfg.color)}>{unit.currentScore}</p>
                    <p className="text-[9px] text-slate-500 font-mono">/100</p>
                  </div>
                  <ChevronRight size={14} className={cn('shrink-0', cfg.color)} />
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* Matriz de risco visual + cenários */}
        <div className="space-y-4">
          {/* Matriz */}
          <GlassCard className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest">Cenários de Risco</h2>
            <div className="space-y-3">
              {RISK_SCENARIOS.map((scenario, i) => {
                const riskScore = (scenario.probability * scenario.impact) / 100;
                const riskLevel = riskScore > 70 ? 'CRÍTICO' : riskScore > 50 ? 'ALTO' : riskScore > 30 ? 'MÉDIO' : 'BAIXO';
                const riskColor = riskScore > 70 ? 'text-red-400' : riskScore > 50 ? 'text-orange-400' : riskScore > 30 ? 'text-amber-400' : 'text-emerald-400';
                return (
                  <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-white">{scenario.title}</p>
                      <span className={cn('text-[9px] font-bold uppercase tracking-widest', riskColor)}>{riskLevel}</span>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">{scenario.category}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">Probabilidade</p>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${scenario.probability}%` }} />
                        </div>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">{scenario.probability}%</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-mono text-slate-600 uppercase mb-1">Impacto</p>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${scenario.impact}%` }} />
                        </div>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">{scenario.impact}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Ação rápida */}
          {selectedUnit && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard className={cn('border', RISK_CONFIG[selectedUnit.risk].border, RISK_CONFIG[selectedUnit.risk].bg)}>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">Unidade Selecionada</p>
                <p className="font-bold text-white uppercase">{selectedUnit.name}</p>
                <p className={cn('text-2xl font-bold font-mono mt-1', RISK_CONFIG[selectedUnit.risk].color)}>
                  Score: {selectedUnit.currentScore}/100
                </p>
                {selectedUnit.lastDiagnostic && (
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">{selectedUnit.lastDiagnostic}</p>
                )}
                <button
                  onClick={() => onStartSurvey(selectedUnit)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl transition-all"
                >
                  Iniciar Vistoria de Risco
                  <ChevronRight size={12} />
                </button>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
