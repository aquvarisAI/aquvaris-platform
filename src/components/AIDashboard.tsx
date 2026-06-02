import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Loader2, ChevronRight, AlertTriangle, CheckCircle2, Activity, Droplets, Trash2, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './ui/GlassCard';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface AIDashboardProps {
  units: UnitIntelligence[];
  onStartSurvey: (unit: UnitIntelligence) => void;
}

const PROMPTS = [
  { label: 'Water Positive Score', icon: Droplets, prompt: 'Analise o consumo hídrico desta unidade, calcule o Water Positive Score atual e identifique os 3 principais vetores de perda hídrica. Simule quanto de redução adicional é possível até 2030.' },
  { label: 'Carbon Intelligence', icon: Zap, prompt: 'Mapeie as emissões Scope 1, 2 e 3 desta operação. Identifique onde estão as maiores oportunidades de redução no curto prazo (0-12 meses) e projete a trajetória até net-zero 2050.' },
  { label: 'Diagnóstico de Risco', icon: Shield, prompt: 'Analise o score ambiental desta unidade e gere um diagnóstico completo de risco. Identifique anomalias, priorize ações e estime o impacto financeiro dos riscos não gerenciados.' },
  { label: 'Plano Regenerativo', icon: Activity, prompt: 'Com base nos dados desta unidade, gere um plano de ação regenerativo priorizado. Quais ações elevam o score ambiental em 20 pontos nos próximos 90 dias?' },
  { label: 'Análise de Resíduos', icon: Trash2, prompt: 'Analise a geração de resíduos desta operação. Identifique oportunidades de economia circular, calcule o Circularity Score e detecte oportunidades de simbiose industrial.' },
];

const RISK_COLOR: Record<EnvironmentalRisk, string> = {
  [EnvironmentalRisk.LOW]: 'text-emerald-400',
  [EnvironmentalRisk.MEDIUM]: 'text-amber-400',
  [EnvironmentalRisk.HIGH]: 'text-orange-400',
  [EnvironmentalRisk.CRITICAL]: 'text-red-400',
};

export function AIDashboard({ units, onStartSurvey }: AIDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitIntelligence | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);

  const callGemini = async (prompt: string) => {
    if (!selectedUnit) return;
    setLoading(true);
    setResponse(null);
    setActivePrompt(prompt);

    const fullPrompt = `
Você é o motor de inteligência ambiental da Aquvaris AI, especializado em ESG, sustentabilidade e auditoria ambiental.

## Dados da Unidade
- Nome: ${selectedUnit.name}
- Endereço: ${selectedUnit.address}
- Score Ambiental: ${selectedUnit.currentScore}/100
- Nível de Risco: ${selectedUnit.risk}
- Alertas Ativos: ${selectedUnit.alerts.length}
${selectedUnit.alerts.map(a => `  - ${a.message}`).join('\n')}
${selectedUnit.lastDiagnostic ? `- Último Diagnóstico: ${selectedUnit.lastDiagnostic}` : ''}

## Solicitação
${prompt}

## Instrução
Responda em português brasileiro, de forma técnica e objetiva. Use dados concretos quando disponíveis. Estruture a resposta com seções claras. Máximo 400 palavras.
`;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: fullPrompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map((c: any) => c.text || '').join('') || 'Sem resposta.';
      setResponse(text);
    } catch (err) {
      setResponse('Erro ao conectar com a IA. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8 scrollbar-hide">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aquvaris AI</h1>
          <p className="text-sm text-slate-400">Motor de inteligência ambiental — powered by Gemini</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">IA Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left — Seleção de unidade + prompts */}
        <div className="space-y-6">
          {/* Selecionar unidade */}
          <GlassCard className="space-y-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Selecionar Unidade</h3>
            <div className="space-y-2">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => { setSelectedUnit(unit); setResponse(null); }}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    selectedUnit?.id === unit.id
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/5 border-white/5 hover:border-white/20'
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full shrink-0', RISK_COLOR[unit.risk].replace('text-', 'bg-'))} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{unit.name}</p>
                    <p className={cn('text-[10px] font-mono', RISK_COLOR[unit.risk])}>{unit.currentScore}/100</p>
                  </div>
                  {selectedUnit?.id === unit.id && <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-auto" />}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Prompts rápidos */}
          <GlassCard className="space-y-3">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Análises Rápidas</h3>
            {PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => selectedUnit && callGemini(p.prompt)}
                disabled={!selectedUnit || loading}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                  activePrompt === p.prompt && response
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/5 hover:border-emerald-500/20',
                  !selectedUnit || loading ? 'opacity-40 cursor-not-allowed' : ''
                )}
              >
                <p.icon size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-white">{p.label}</span>
                <ChevronRight size={12} className="text-slate-600 ml-auto shrink-0" />
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Right — Chat / Resposta */}
        <div className="xl:col-span-2 space-y-4">
          {/* Input customizado */}
          <GlassCard className="space-y-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Pergunta Personalizada</h3>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-none h-24 placeholder:text-slate-600"
              placeholder={selectedUnit
                ? `Ex: "Quais ações elevam o score da ${selectedUnit.name} em 15 pontos nos próximos 90 dias?"`
                : 'Selecione uma unidade primeiro...'}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={!selectedUnit}
            />
            <button
              onClick={() => customPrompt.trim() && callGemini(customPrompt)}
              disabled={!selectedUnit || !customPrompt.trim() || loading}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {loading ? 'Analisando...' : 'Analisar com IA'}
            </button>
          </GlassCard>

          {/* Resposta */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <BrainCircuit size={32} className="text-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Processando dados ambientais...</p>
              </motion.div>
            )}

            {response && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Sparkles size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Aquvaris AI</p>
                      <p className="text-[10px] font-mono text-slate-500">Análise gerada para {selectedUnit?.name}</p>
                    </div>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {response}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                      Baseado nos dados da vistoria mais recente
                    </p>
                    <button
                      onClick={() => onStartSurvey(selectedUnit!)}
                      className="text-[10px] font-mono text-emerald-400 hover:underline uppercase tracking-widest"
                    >
                      Iniciar Nova Vistoria →
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {!response && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 gap-4 opacity-20"
              >
                <BrainCircuit size={48} className="text-white" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  {selectedUnit ? 'Selecione uma análise ou faça uma pergunta' : 'Selecione uma unidade para começar'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
