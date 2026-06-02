import React, { useState } from 'react';
import { Trash2, Recycle, AlertTriangle, CheckCircle2, TrendingDown, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence } from '../types';
import { cn } from '../lib/utils';

interface WasteDashboardProps {
  units: UnitIntelligence[];
}

const WASTE_CATEGORIES = [
  { name: 'Orgânicos', value: 35, color: '#10B981', recyclable: true },
  { name: 'Recicláveis', value: 28, color: '#3B82F6', recyclable: true },
  { name: 'Rejeitos', value: 22, color: '#EF4444', recyclable: false },
  { name: 'Perigosos', value: 8, color: '#F97316', recyclable: false },
  { name: 'Eletrônicos', value: 7, color: '#8B5CF6', recyclable: true },
];

const MONTHLY_DATA = [
  { mes: 'Jan', gerado: 420, desviado: 310 },
  { mes: 'Fev', gerado: 380, desviado: 290 },
  { mes: 'Mar', gerado: 450, desviado: 340 },
  { mes: 'Abr', gerado: 410, desviado: 330 },
  { mes: 'Mai', gerado: 390, desviado: 320 },
  { mes: 'Jun', gerado: 360, desviado: 310 },
];

export function WasteDashboard({ units }: WasteDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitIntelligence>(units[0]);

  const recyclablePercent = WASTE_CATEGORIES.filter(w => w.recyclable).reduce((acc, w) => acc + w.value, 0);
  const circularityScore = Math.round(recyclablePercent * 0.9);
  const wasteDeviation = Math.round((MONTHLY_DATA[MONTHLY_DATA.length - 1].desviado / MONTHLY_DATA[MONTHLY_DATA.length - 1].gerado) * 100);

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Resíduos</h1>
          <p className="text-sm text-slate-400">Circularity Analytics — economia circular inteligente</p>
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
          { label: 'Circularity Score', value: circularityScore, unit: '/100', color: circularityScore >= 70 ? 'text-emerald-400' : 'text-amber-400', icon: Recycle, sub: circularityScore >= 70 ? 'Circular' : 'Em desenvolvimento' },
          { label: 'Waste Diversion Rate', value: wasteDeviation, unit: '%', color: 'text-blue-400', icon: TrendingDown, sub: 'Desviado de aterro' },
          { label: 'Resíduos Recicláveis', value: recyclablePercent, unit: '%', color: 'text-emerald-400', icon: BarChart3, sub: 'Do total gerado' },
          { label: 'Resíduos Perigosos', value: WASTE_CATEGORIES.find(w => w.name === 'Perigosos')?.value || 0, unit: '%', color: 'text-orange-400', icon: AlertTriangle, sub: 'Requer atenção' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pizza */}
        <GlassCard className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Composição de Resíduos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={WASTE_CATEGORIES} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {WASTE_CATEGORIES.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                formatter={(value: any) => [`${value}%`, 'Percentual']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {WASTE_CATEGORIES.map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-[10px] font-mono text-slate-400">{cat.name}</span>
                  {cat.recyclable && <span className="text-[8px] font-bold text-emerald-400 uppercase">♻</span>}
                </div>
                <span className="text-[10px] font-mono text-slate-300">{cat.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tendência mensal */}
        <GlassCard className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest">Geração vs Desvio de Aterro</h2>
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-red-400/50 rounded inline-block" /> Gerado</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-emerald-400 rounded inline-block" /> Desviado</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY_DATA} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fill: '#64748B', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748B', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Bar dataKey="gerado" fill="#EF4444" fillOpacity={0.5} name="Gerado (kg)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="desviado" fill="#10B981" name="Desviado (kg)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Oportunidades de economia circular */}
      <GlassCard className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest">Oportunidades de Simbiose Industrial</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Resíduos Orgânicos → Compostagem', saving: 'R$ 12.400/ano', impact: 'Alto', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
            { title: 'Rejeitos → Co-processamento Cimenteiro', saving: 'R$ 8.200/ano', impact: 'Médio', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
            { title: 'Resíduos Perigosos → Logística Reversa', saving: 'Conformidade Legal', impact: 'Crítico', color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
          ].map((opp, i) => (
            <div key={i} className={cn('p-5 rounded-xl border', opp.border, opp.bg)}>
              <p className="text-xs font-bold text-white mb-2">{opp.title}</p>
              <p className={cn('text-sm font-bold font-mono', opp.color)}>{opp.saving}</p>
              <span className={cn('text-[9px] font-bold uppercase tracking-widest mt-1 block', opp.color)}>Impacto {opp.impact}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
