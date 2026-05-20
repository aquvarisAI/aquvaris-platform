import React from 'react';
import { 
  Briefcase, 
  Code2, 
  Cpu, 
  Globe2, 
  Layers, 
  Zap, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Database,
  Cloud,
  Microscope
} from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from './ui/GlassCard';

export function Portfolio() {
  const skills = [
    { name: "Frontend Architecture", Level: "Senior", tech: "React 18, TypeScript, Tailwind" },
    { name: "AI Integration", Level: "Advanced", tech: "Gemini 1.5 Flash, LLM Engineering" },
    { name: "Cloud & Data", Level: "Advanced", tech: "Firebase, Firestore, Cloud Run" },
    { name: "Intelligence Systems", Level: "Expert", tech: "GIS, Google Maps API, Real-time Monitoring" }
  ];

  const valueProps = [
    {
      target: "Solinftec (AgTech/IoT)",
      points: [
        "Monitoramento geoespacial em tempo real",
        "Processamento de dados de sensores para eficiência hídrica",
        "Dashboards de alta densidade para tomada de decisão rápida"
      ],
      icon: Cpu
    },
    {
      target: "Ambipar (Auditoria/ESG)",
      points: [
        "Protocolos digitais de vistoria técnica (Paperless)",
        "Geração automática de Scores Ambientais (ESG Readiness)",
        "Rastreabilidade total de resíduos e efluentes via banco de dados NoSQL"
      ],
      icon: ShieldCheck
    },
    {
      target: "Moss.earth (Clima/Transparência)",
      points: [
        "Arquitetura transparente para auditoria de dados ambientais",
        "IA para análise de anomalias em consumo de recursos",
        "Interface focada em confiança e visualização tecnológica"
      ],
      icon: Globe2
    }
  ];

  return (
    <div className="flex-1 overflow-auto p-4 lg:p-10 space-y-12 scrollbar-hide">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
        <div className="max-w-4xl">
          <p className="text-emerald-400 font-mono text-sm uppercase tracking-[0.3em] mb-4">Currículo Tecnológico & Portfólio</p>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter leading-tight">
            Bruna Preschad <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Engenharia de Software & Inteligência Ambiental
            </span>
          </h1>
          <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl">
            Especialista em construir sistemas que unem o mundo físico (auditoria/sensores) ao digital (AI/Nuvem). 
            Desenvolvedora do ecossistema <span className="text-white font-semibold">Aquvaris AI</span>.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-8">
            <a 
              href="https://github.com/aquvarisAI" 
              target="_blank" 
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest"
            >
              <Code2 size={18} /> GitHub
            </a>
            <a 
              href="https://www.linkedin.com/in/bpreschad/" 
              target="_blank" 
              className="flex items-center gap-2 bg-emerald-500 text-black px-6 py-3 rounded-xl hover:bg-emerald-400 transition-all text-sm font-bold uppercase tracking-widest"
            >
              LinkedIn <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Core Project Showcase */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Layers className="text-emerald-400" /> Projeto Destacado: Aquvaris AI
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-8 border-emerald-500/20 bg-emerald-500/5">
            <h3 className="text-xl font-bold mb-4">Por que é relevante?</h3>
            <p className="text-slate-400 mb-6 font-medium">
              O Aquvaris não é apenas um dashboard; é um motor de auditoria ambiental. 
              Ele resolve o problema de dados dispersos e diagnósticos subjetivos.
            </p>
            <ul className="space-y-4">
              {[
                { label: "Inteligência Geoespacial", text: "Integração via Google Maps para gestão de territórios críticos." },
                { label: "IA Conversacional", text: "Uso de Gemini para automatizar relatórios de vistoria complexos." },
                { label: "Data Pipeline", text: "Firebase Firestore para sincronização de dados em tempo real." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                    {i+1}
                  </div>
                  <div>
                    <strong className="block text-white text-sm">{item.label}</strong>
                    <span className="text-xs text-slate-500">{item.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <GlassCard key={index} className="p-6">
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest mb-1">{skill.Level}</p>
                <h4 className="font-bold text-lg mb-2">{skill.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-mono">{skill.tech}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Fit */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Valor Estratégico por Empresa</h2>
          <p className="text-slate-500 text-sm mt-1 font-mono uppercase tracking-widest opacity-60">Como minhas competências se aplicam ao seu negócio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {valueProps.map((prop, idx) => (
            <GlassCard key={idx} className="p-6 border-white/5 hover:border-white/20 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                <prop.icon className="text-emerald-400" size={24} />
              </div>
              <h4 className="text-lg font-bold mb-4">{prop.target}</h4>
              <ul className="space-y-3">
                {prop.points.map((point, pIdx) => (
                  <li key={pIdx} className="flex gap-3 text-xs text-slate-400 leading-relaxed">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section className="bg-emerald-500/5 rounded-3xl p-8 lg:p-12 border border-emerald-500/10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
             <h2 className="text-3xl font-bold tracking-tighter mb-6">Próximos Passos de Carreira</h2>
             <p className="text-slate-400 mb-8 leading-relaxed">
               Estou em busca de desafios como <strong className="text-white">Senior Frontend / AI Engineer</strong> ou <strong className="text-white">Full-stack Developer (ESG Tech)</strong>. 
               Minha meta é construir as ferramentas que tornarão empresas sustentáveis em líderes de mercado.
             </p>
             <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/5">
                   <Cloud className="text-cyan-400" size={20} />
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Especialidade</p>
                     <p className="text-xs font-bold font-mono">Serverless Systems</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/5">
                   <Microscope className="text-emerald-400" size={20} />
                   <div>
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Pesquisa</p>
                     <p className="text-xs font-bold font-mono">IA Preditiva Hídrica</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="w-full lg:w-[400px] aspect-square rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center p-8 text-center">
             <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/50">
                <Briefcase className="text-black" size={32} />
             </div>
             <h3 className="text-xl font-bold tracking-tight mb-2">Disponível para Projetos</h3>
             <p className="text-sm text-slate-400 font-mono">Fale diretamente comigo para parcerias tecnológicas de impacto ambiental.</p>
          </div>
        </div>
      </section>
      
      <footer className="text-center pb-10 opacity-30 text-[10px] font-mono uppercase tracking-[0.5em]">
        © 2024 AQUVARIS AI / BRUNA PRESCHAD • TECH PORTFOLIO
      </footer>
    </div>
  );
}
