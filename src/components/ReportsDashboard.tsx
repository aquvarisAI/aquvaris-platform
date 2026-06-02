import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, Clock, AlertTriangle, TrendingUp, Shield, Droplets, Zap, Recycle, Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface ReportsDashboardProps {
  units: UnitIntelligence[];
}

const CERTIFICATIONS = [
  { name: 'CDP Triple A', area: 'Climate + Water + Forests', status: 'achieved', progress: 100, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  { name: 'ISO 14001', area: 'Gestão Ambiental', status: 'in_progress', progress: 78, color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  { name: 'ISO 46001', area: 'Gestão Hídrica', status: 'in_progress', progress: 65, color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5' },
  { name: 'SBTi Net Zero', area: 'Metas Climáticas', status: 'in_progress', progress: 55, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
  { name: 'AWS Platinum', area: 'Water Stewardship', status: 'gap', progress: 42, color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
  { name: 'B Corp', area: 'Impacto Social', status: 'gap', progress: 30, color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/5' },
];

const REPORTS = [
  { title: 'Relatório ESG Q2 2026', type: 'ESG', date: '30 Mai 2026', status: 'ready', size: '2.4 MB' },
  { title: 'Inventário de Emissões GHG', type: 'Carbon', date: '15 Mai 2026', status: 'ready', size: '1.8 MB' },
  { title: 'Balanço Hídrico Anual', type: 'Water', date: '01 Mai 2026', status: 'ready', size: '3.1 MB' },
  { title: 'Relatório de Resíduos Q1', type: 'Circularity', date: '30 Abr 2026', status: 'processing', size: '--' },
  { title: 'Auditoria de Conformidade', type: 'Legal', date: '20 Abr 2026', status: 'ready', size: '5.2 MB' },
];

const ESG_SCORES = [
  { label: 'Carbon Score', value: 72, icon: Zap, color: '#10B981' },
  { label: 'Water Score', value: 85, icon: Droplets, color: '#3B82F6' },
  { label: 'Circularity Score', value: 63, icon: Recycle, color: '#8B5CF6' },
  { label: 'Nature Score', value: 58, icon: Leaf, color: '#F59E0B' },
  { label: 'Risk Score', value: 70, icon: Shield, color: '#F97316' },
];

export function ReportsDashboard({ units }: ReportsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'certifications' | 'reports'>('overview');

  const avgScore = Math.round(units.reduce((acc, u) => acc + u.currentScore, 0) / (units.length || 1));
  const esgOverall = Math.round(ESG_SCORES.reduce((acc, s) => acc + s.value, 0) / ESG_SCORES.length);

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios & ESG</h1>
          <p className="text-sm text-slate-400">ESG Command Center — transparência e conformidade</p>
        </div>
        <div className="flex items-center gap-2">
          {(['overview', 'certifications', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
                activeTab === tab
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
              )}
            >
              {tab === 'overview' ? 'Visão Geral' : tab === 'certifications' ? 'Certificações' : 'Relatórios'}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* ESG Score geral */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="flex flex-col items-center justify-center py-8 border-emerald-500/20 bg-emerald-500/5">
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-2">ESG Score Global</p>
              <p className="text-7xl font-bold text-white font-mono">{esgOverall}</p>
              <p className="text-slate-400 text-sm mt-2">/100 — {esgOverall >= 70 ? 'Bom' : esgOverall >= 50 ? 'Atenção' : 'Crítico'}</p>
              <div className="mt-4 w-full px-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${esgOverall}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
              </div>
            </GlassCard>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {ESG_SCORES.map((score, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                  <GlassCard className="space-y-3">
                    <div className="flex items-center gap-2">
                      <score.icon size={14} style={{ color: score.color }} />
                      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{score.label}</p>
                    </div>
                    <p className="text-2xl font-bold font-mono" style={{ color: score.color }}>{score.value}<span className="text-sm text-slate-500">/100</span></p>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score.value}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: score.color }}
                      />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Unidades ranking */}
          <GlassCard className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest">Ranking de Unidades</h2>
            <div className="space-y-2">
              {[...units].sort((a, b) => b.currentScore - a.currentScore).map((unit, i) => (
                <div key={unit.id} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-lg font-bold font-mono text-slate-600 w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white uppercase truncate">{unit.name}</p>
                    <div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', unit.currentScore >= 70 ? 'bg-emerald-500' : unit.currentScore >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                        style={{ width: `${unit.currentScore}%` }}
                      />
                    </div>
                  </div>
                  <p className={cn('text-xl font-bold font-mono shrink-0', unit.currentScore >= 70 ? 'text-emerald-400' : unit.currentScore >= 50 ? 'text-amber-400' : 'text-red-400')}>
                    {unit.currentScore}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'certifications' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CERTIFICATIONS.map((cert, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className={cn('space-y-4 border', cert.border, cert.bg)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">{cert.name}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{cert.area}</p>
                  </div>
                  {cert.status === 'achieved' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                  {cert.status === 'in_progress' && <Clock size={18} className="text-amber-400 shrink-0" />}
                  {cert.status === 'gap' && <AlertTriangle size={18} className="text-red-400 shrink-0" />}
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-500">Aderência</span>
                    <span className={cert.color}>{cert.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cert.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: cert.color.replace('text-', '').includes('emerald') ? '#10B981' : cert.color.includes('blue') ? '#3B82F6' : cert.color.includes('cyan') ? '#06B6D4' : cert.color.includes('amber') ? '#F59E0B' : cert.color.includes('orange') ? '#F97316' : '#EF4444' }}
                    />
                  </div>
                </div>
                <p className={cn('text-[9px] font-bold uppercase tracking-widest', cert.color)}>
                  {cert.status === 'achieved' ? '✓ Certificação Ativa' : cert.status === 'in_progress' ? '⟳ Em Progresso' : '✗ Gap Identificado'}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-3">
          {REPORTS.map((report, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileText size={18} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{report.title}</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{report.type} · {report.date} · {report.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {report.status === 'ready' ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Disponível
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-400 uppercase tracking-widest">
                      <Clock size={12} /> Processando
                    </span>
                  )}
                  {report.status === 'ready' && (
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-emerald-500 text-slate-400 hover:text-white transition-all">
                      <Download size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
