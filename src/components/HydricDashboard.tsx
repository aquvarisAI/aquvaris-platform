import React, { useState } from 'react';
import { Droplets, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { motion } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface HydricDashboardProps {
  units: UnitIntelligence[];
}

const RISK_COLOR: Record<EnvironmentalRisk, string> = {
  [EnvironmentalRisk.LOW]: '#10B981',
  [EnvironmentalRisk.MEDIUM]: '#F59E0B',
  [EnvironmentalRisk.HIGH]: '#F97316',
  [EnvironmentalRisk.CRITICAL]: '#EF4444',
};

export function HydricDashboard({ units }: HydricDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitIntelligence>(units[0]);

  const totalConsumption = selectedUnit.consumptionHistory.reduce((acc, d) => acc + d.value, 0);
  const totalExpected = selectedUnit.consumptionHistory.reduce((acc, d) => acc + d.expected, 0);
  const efficiency = Math.round((1 - (totalConsumption - totalExpected) / totalExpected) * 100);
  const hasLeaks = selectedUnit.alerts.some(a => a.type === 'LEAK');

  const waterPositiveScore = Math.min(100, Math.max(0, efficiency));

  const comparisonData = units.map(u => ({
    name: u.name.split(' ').slice(0, 2).join(' '),
    consumo: Math.round(u.consumptionHistory.reduce((acc, d) => acc + d.value, 0)),
    esperado: Math.round(u.consumptionHistory.reduce((acc, d) => acc + d.expected, 0)),
    score: u.currentScore,
  }));

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consumo Hídrico</h1>
          <p className="text-sm text-slate-400">Water Positive Intelligence — monitoramento em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          {units.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUnit(u)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
                selectedUnit.id === u.id
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
              )}
            >
              {u.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Water Positive Score',
            value: `${waterPositiveScore}`,
            unit: '/100',
            icon: Droplets,
            color: waterPositiveScore >= 70 ? 'text-emerald-400' : waterPositiveScore >= 50 ? 'text-amber-400' : 'text-red-400',
            sub: waterPositiveScore >= 70 ? 'Eficiente' : waterPositiveScore >= 50 ? 'Atenção' : 'Crítico',
          },
          {
            label: 'Consumo Total',
            value: `${Math.round(totalConsumption).toLocaleString('pt-BR')}`,
            unit: 'm³',
            icon: Activity,
            color: 'text-blue-400',
            sub: '24 horas',
          },
          {
            label: 'Desvio do Esperado',
            value: `${totalConsumption > totalExpected ? '+' : ''}${Math.round(((totalConsumption - totalExpected) / totalExpected) * 100)}`,
            unit: '%',
            icon: totalConsumption > totalExpected ? TrendingUp : TrendingDown,
            color: totalConsumption > totalExpected ? 'text-red-400' : 'text-emerald-400',
            sub: totalConsumption > totalExpected ? 'Acima do esperado' : 'Abaixo do esperado',
          },
          {
            label: 'Status de Vazamento',
            value: hasLeaks ? 'Detectado' : 'Normal',
            unit: '',
            icon: hasLeaks ? AlertTriangle : CheckCircle2,
            color: hasLeaks ? 'text-red-400' : 'text-emerald-400',
            sub: hasLeaks ? `${selectedUnit.alerts.filter(a => a.type === 'LEAK').length} alerta(s)` : 'Sem anomalias',
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="flex items-center gap-4">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0', kpi.color)}>
                <kpi.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{kpi.label}</p>
                <p className={cn('text-2xl font-bold font-mono mt-0.5', kpi.color)}>
                  {kpi.value}<span className="text-sm text-slate-500">{kpi.unit}</span>
                </p>
                <p className="text-[10px] text-slate-600 font-mono">{kpi.sub}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </section>

      {/* Gráfico de consumo */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <GlassCard className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest">Série Temporal — {selectedUnit.name}</h2>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-400 inline-block" /> Consumo Real</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 inline-block border-dashed border-t" /> Esperado</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={selectedUnit.consumptionHistory}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ color: '#94A3B8', fontSize: 10 }}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="url(#colorValue)" strokeWidth={2} name="Consumo Real" />
              <Area type="monotone" dataKey="expected" stroke="#10B981" fill="url(#colorExpected)" strokeWidth={2} strokeDasharray="4 4" name="Esperado" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Alertas hídricos */}
        <GlassCard className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Alertas Hídricos</h2>
          {selectedUnit.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-30">
              <CheckCircle2 size={32} className="text-emerald-400" />
              <p className="text-xs font-mono uppercase tracking-widest">Sem alertas ativos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedUnit.alerts.map((alert, i) => (
                <div key={i} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={12} className="text-red-400" />
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{alert.type}</p>
                  </div>
                  <p className="text-xs text-slate-300">{alert.message}</p>
                  <p className="text-[9px] font-mono text-slate-500 mt-1">{new Date(alert.timestamp).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>
          )}

          {/* Water Positive gauge */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Water Positive Index</p>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${waterPositiveScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn('h-full rounded-full', waterPositiveScore >= 70 ? 'bg-emerald-500' : waterPositiveScore >= 50 ? 'bg-amber-500' : 'bg-red-500')}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>0 — Negativo</span>
              <span className={waterPositiveScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{waterPositiveScore}/100</span>
              <span>100 — Positivo</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Comparativo entre unidades */}
      <GlassCard className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">Comparativo entre Unidades</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={comparisonData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 10 }} />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
            />
            <Bar dataKey="consumo" fill="#3B82F6" name="Consumo Real" radius={[4, 4, 0, 0]} />
            <Bar dataKey="esperado" fill="#10B981" name="Esperado" radius={[4, 4, 0, 0]} opacity={0.5} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>
    </div>
  );
}
