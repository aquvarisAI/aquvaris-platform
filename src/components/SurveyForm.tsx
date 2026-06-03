import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Droplets, 
  Users, 
  X,
  Zap,
  Trash2,
  Map as MapIcon,
  Activity,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Camera,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TechnicalSurvey, UnitIntelligence, EnvironmentalRisk } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { analyzeEvidenceImages, calculatePredictiveScore } from '../services/geminiService';

import { cn } from '../lib/utils';

interface SurveyFormProps {
  unit: UnitIntelligence;
  onClose: () => void;
  onSuccess: (score: number) => void;
}

const STEPS = [
  { id: 1, label: 'Identificação', icon: Users, sub: 'Dados da empresa' },
  { id: 2, label: 'Território', icon: MapIcon, sub: 'Localização e entorno' },
  { id: 3, label: 'Água', icon: Droplets, sub: 'Consumo e captação' },
  { id: 4, label: 'Resíduos', icon: Trash2, sub: 'Geração e destinação' },
  { id: 5, label: 'Energia', icon: Zap, sub: 'Consumo e eficiência' },
  { id: 6, label: 'Risco Ambiental', icon: ShieldAlert, sub: 'Matriz de risco' },
  { id: 7, label: 'Evidências', icon: ClipboardCheck, sub: 'Anexos e registros' },
  { id: 8, label: 'Diagnóstico IA', icon: Sparkles, sub: 'Análise e recomendações' },
];

export function SurveyForm({ unit, onClose, onSuccess }: SurveyFormProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [predictedScore, setPredictedScore] = useState<number | null>(null);
  const [visionAnalysis, setVisionAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    occupiedArea: '1000',
    landscapeIntegrity: '80',
    meterReading: '',
    observedLeaks: false,
    waterPressure: 'NORMAL' as 'LOW' | 'NORMAL' | 'HIGH',
    wasteKG: '0',
    segregationScore: '100',
    hazardousWaste: false,
    kwhReading: '',
    peakDemand: '0',
    mainGridStable: true,
    liability: false,
    riskCategory: EnvironmentalRisk.LOW,
    riskDetails: '',
    observations: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setLoading(true);

    const surveyData: TechnicalSurvey = {
      unitId: unit.id,
      inspectorId: auth.currentUser.uid,
      timestamp: new Date().toISOString(),
      territorial: {
        occupiedArea: parseFloat(formData.occupiedArea),
        landscapeIntegrity: parseInt(formData.landscapeIntegrity)
      },
      hydric: {
        meterReading: parseFloat(formData.meterReading || '0'),
        observedLeaks: formData.observedLeaks,
        waterPressure: formData.waterPressure
      },
      waste: {
        volumeKG: parseFloat(formData.wasteKG),
        segregationScore: parseInt(formData.segregationScore),
        hazardousWaste: formData.hazardousWaste
      },
      energy: {
        kwhReading: parseFloat(formData.kwhReading || '0'),
        peakDemand: parseFloat(formData.peakDemand),
        mainGridStable: formData.mainGridStable
      },
      risk: {
        environmentalLiability: formData.liability,
        riskCategory: formData.riskCategory,
        riskDetails: formData.riskDetails
      },
      evidenceImages: images,
      calculatedScore: predictedScore || 0,
      aiDiagnostic: visionAnalysis || formData.observations
    };

    try {
      await addDoc(collection(db, 'surveys'), surveyData);
      onSuccess(surveyData.calculatedScore || 0);
    } catch (error) {
      console.error("Error saving survey:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#080C14]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0B1118] w-full max-w-5xl h-[85vh] border border-white/10 rounded-2xl overflow-hidden flex shadow-2xl"
      >
        {/* Left Sidebar - Steps Protocol */}
        <div className="w-72 bg-[#0F172A]/50 border-r border-white/5 flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
          <div className="p-8 border-b border-white/5">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] mb-1">Protocolo de Vistoria</h2>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest whitespace-nowrap">Vistoria #VST-{new Date().getFullYear()}-{(Math.random() * 10000).toFixed(0)}</p>
          </div>
          
          <div className="flex-1">
            {STEPS.map((s) => (
              <button
                key={s.id}
                disabled={loading}
                onClick={() => setStep(s.id)}
                className={`w-full flex items-center gap-4 px-8 py-5 border-l-2 transition-all group ${
                  step === s.id 
                    ? 'border-emerald-500 bg-emerald-500/5' 
                    : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono border ${
                  step === s.id ? 'bg-emerald-500 text-white border-emerald-500' : 'border-white/10'
                }`}>
                  {s.id}
                </div>
                <div className="text-left">
                  <p className={`text-xs font-bold uppercase tracking-widest ${step === s.id ? 'text-white' : 'text-gray-500'}`}>
                    {s.label}
                  </p>
                  <p className="text-[9px] text-gray-600 truncate mt-0.5">{s.sub}</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-8 border-t border-white/5 bg-[#080C14]/40">
             <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none">
                <span>Progresso</span>
                <span>{Math.round((step/8)*100)}%</span>
             </div>
             <div className="h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(step/8)*100}%` }}
                  className="h-full bg-emerald-500" 
                />
             </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[#0B1118] to-[#080C14]">
          {/* Header */}
          <div className="px-10 py-8 flex items-center justify-between border-b border-white/5 shrink-0">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                   {React.createElement(STEPS[step-1].icon, { size: 24 })}
                </div>
                <div>
                   <h3 className="text-lg font-bold tracking-tight uppercase leading-none">{STEPS[step-1].label}</h3>
                   <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1 opacity-60">Fase Operacional — Camada {step}</p>
                </div>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
                <X size={20} />
             </button>
          </div>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto px-10 py-10 scrollbar-hide">
             <AnimatePresence mode="wait">
               <motion.div
                 key={step}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="max-w-xl"
               >
                 {step === 1 && (
                   <div className="space-y-8">
                      <div className="p-6 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-6">
                         <div className="w-16 h-16 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                            <Activity size={32} />
                         </div>
                         <div>
                            <p className="text-xl font-bold uppercase tracking-tight leading-none">{unit.name}</p>
                            <p className="text-xs text-gray-500 mt-2 italic opacity-60">{unit.address}</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                            <p className="stat-label">Analista Responsável</p>
                            <p className="text-sm font-semibold mt-1">{auth.currentUser?.displayName || 'Bruna'}</p>
                         </div>
                         <div className="p-5 bg-white/5 rounded-xl border border-white/5">
                            <p className="stat-label">Selo Temporal</p>
                            <p className="text-sm font-semibold mt-1">{new Date().toLocaleDateString('pt-BR')} — <span className="text-emerald-400">REALTIME</span></p>
                         </div>
                      </div>
                   </div>
                 )}

                 {step === 2 && (
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="stat-label">Área Ocupada (m²)</label>
                        <input 
                          type="number" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-2xl font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                          value={formData.occupiedArea}
                          onChange={(e) => setFormData({...formData, occupiedArea: e.target.value})}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-500">
                          <label>Integridade da Paisagem</label>
                          <span className="text-emerald-400 font-mono">{formData.landscapeIntegrity}%</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-white/10 accent-emerald-500 appearance-none rounded-lg cursor-pointer" value={formData.landscapeIntegrity} onChange={(e) => setFormData({...formData, landscapeIntegrity: e.target.value})} />
                      </div>
                   </div>
                 )}

                 {step === 3 && (
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="stat-label">Leitura de Hidrômetro</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-4xl font-mono focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-white/5" 
                            value={formData.meterReading} 
                            onChange={(e) => setFormData({...formData, meterReading: e.target.value})} 
                            placeholder="000000.0" 
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded border border-white/10">
                             <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none">m³</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setFormData({...formData, observedLeaks: !formData.observedLeaks})}
                          className={`p-5 rounded-xl border flex flex-col gap-3 transition-all ${
                            formData.observedLeaks ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-white/5 border-white/5 text-gray-500'
                          }`}
                        >
                          <AlertTriangle size={20} className={formData.observedLeaks ? 'text-rose-500' : 'text-gray-700'} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Vazamento Detectado</span>
                        </button>
                        <select 
                           className="bg-white/5 border border-white/10 rounded-xl p-5 text-xs font-bold uppercase tracking-widest text-white outline-none focus:ring-1 focus:ring-emerald-500 appearance-none" 
                           value={formData.waterPressure} 
                           onChange={(e) => setFormData({...formData, waterPressure: e.target.value as any})}
                        >
                          <option value="LOW">Pressão: Baixa</option>
                          <option value="NORMAL">Pressão: Normal</option>
                          <option value="HIGH">Pressão: Alta</option>
                        </select>
                      </div>
                   </div>
                 )}

                 {step === 4 && (
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="stat-label">Geração de Resíduos (KG/dia)</label>
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-2xl font-mono focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.wasteKG} onChange={(e) => setFormData({...formData, wasteKG: e.target.value})} />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-500">
                          <label>Segregação Efetiva</label>
                          <span className="text-emerald-400 font-mono">{formData.segregationScore}%</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-white/10 accent-emerald-500 appearance-none rounded-lg" value={formData.segregationScore} onChange={(e) => setFormData({...formData, segregationScore: e.target.value})} />
                      </div>
                      <button 
                        onClick={() => setFormData({...formData, hazardousWaste: !formData.hazardousWaste})}
                        className={`w-full p-5 rounded-xl border flex items-center gap-4 transition-all ${
                          formData.hazardousWaste ? 'bg-amber-500/10 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/5 text-gray-500'
                        }`}
                      >
                        <ShieldAlert size={20} className={formData.hazardousWaste ? 'text-amber-500' : 'text-gray-700'} />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Resíduos Perigosos / Tóxicos</span>
                      </button>
                   </div>
                 )}

                 {step === 5 && (
                   <div className="space-y-8">
                       <div className="space-y-3">
                        <label className="stat-label">Medição Elétrica (kWh)</label>
                        <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-2xl font-mono focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.kwhReading} onChange={(e) => setFormData({...formData, kwhReading: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <label className="stat-label">Pico kW</label>
                           <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500" value={formData.peakDemand} onChange={(e) => setFormData({...formData, peakDemand: e.target.value})} />
                         </div>
                         <button 
                           onClick={() => setFormData({...formData, mainGridStable: !formData.mainGridStable})}
                           className={`p-4 rounded-xl border flex items-center justify-center gap-3 transition-all mt-6 ${
                             formData.mainGridStable ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                           }`}
                         >
                            <Zap size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Grade Estável</span>
                         </button>
                      </div>
                   </div>
                 )}

                 {step === 6 && (
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-3">
                         {Object.values(EnvironmentalRisk).map(r => (
                           <button 
                             key={r}
                             onClick={() => setFormData({...formData, riskCategory: r})}
                             className={`p-4 border rounded-xl font-mono text-[9px] uppercase tracking-widest transition-all ${
                               formData.riskCategory === r 
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/10' 
                                : 'bg-white/5 border-white/5 text-gray-500'
                             }`}
                           >
                             Risco: {r}
                           </button>
                         ))}
                      </div>
                      <button 
                         onClick={() => setFormData({...formData, liability: !formData.liability})}
                         className={`w-full p-5 rounded-xl border flex items-center gap-4 transition-all ${
                           formData.liability ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-white/5 border-white/5 text-gray-500'
                         }`}
                      >
                         <AlertTriangle size={20} className={formData.liability ? 'text-rose-500' : 'text-gray-700'} />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Inconformidade Legal / Passivo</span>
                      </button>
                      <textarea 
                        placeholder="Descrever matriz de risco identificada..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-sm font-sans focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none"
                        value={formData.riskDetails}
                        onChange={(e) => setFormData({...formData, riskDetails: e.target.value})}
                      />
                   </div>
                 )}

                 {step === 7 && (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
                         <p className="text-xs text-gray-400 italic">Camada de evidências óticas para validação por IA e Auditoria.</p>
                         <label className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                            <Camera size={16} />
                            Capturar Imagem
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                         </label>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                         {images.map((img, i) => (
                           <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(i)}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                           </motion.div>
                         ))}
                         {images.length === 0 && (
                            <div className="col-span-3 h-40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 grayscale opacity-30">
                               <Camera size={32} />
                               <span className="stat-label">Aguardando Captura</span>
                            </div>
                         )}
                      </div>

                      <div className="space-y-3">
                         <label className="stat-label">Relato de Campo Técnico</label>
                         <textarea 
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-6 text-sm font-sans focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-none"
                            placeholder="Descreva as condições observadas durante o protocolo..."
                            value={formData.observations}
                            onChange={(e) => setFormData({...formData, observations: e.target.value})}
                         />
                      </div>
                   </div>
                 )}

                 {step === 8 && (
                   <div className="space-y-8 flex flex-col items-center justify-center">
                       <div className="w-full bg-gradient-to-br from-emerald-500/20 to-[#080C14] border border-emerald-500/20 p-10 rounded-2xl text-center relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:scale-110 transition-transform duration-1000">
                             <Sparkles size={120} />
                          </div>
                          <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-[0.2em] mb-4">Calculated Predictive Score</p>
                          <div className="text-7xl font-bold bg-gradient-to-t from-emerald-500 to-white bg-clip-text text-transparent">
                             {predictedScore || '--'}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-6 font-mono uppercase tracking-widest">Matriz de Eficiência Territorial</p>
                       </div>

                       <div className="w-full bg-white/2 border border-white/5 rounded-2xl p-8 space-y-6">
                           <div className="flex items-center justify-between">
                              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Image Vision Engine</h4>
                              <button 
                                onClick={async () => {
                                  setIsAnalyzing(true);
                                  const context = `Vistoria de ${unit.name} - Risco: ${formData.riskCategory}. Vazamento: ${formData.observedLeaks ? 'Sim' : 'Não'}. ${formData.observations}`;
                                  const analysis = await analyzeEvidenceImages(images, context);
                                  setVisionAnalysis(analysis);
                                  setIsAnalyzing(false);
                                }}
                                disabled={isAnalyzing}
                                className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                              >
                                {isAnalyzing ? 'Processando...' : visionAnalysis ? 'Mapear Novamente' : 'Iniciar Escaneamento'}
                              </button>
                           </div>

                           <div className="min-h-[140px] flex items-center justify-center">
                              {visionAnalysis ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-100/70 leading-loose italic text-center px-6">
                                   "{visionAnalysis}"
                                </motion.div>
                              ) : (
                                <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                                   <BrainCircuit className="text-white" size={40} />
                                   <span className="text-[10px] uppercase font-mono tracking-widest">IA aguardando dados óticos</span>
                                </div>
                              )}
                           </div>
                       </div>
                   </div>
                 )}
               </motion.div>
             </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="px-10 py-8 border-t border-white/5 bg-[#080C14]/60 flex items-center justify-between shrink-0">
             {step > 1 ? (
                <button 
                  onClick={() => setStep(s => s - 1)}
                  className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                  Fase Anterior
                </button>
             ) : <div />}

             <div className="flex items-center gap-4">
                <p className="text-[10px] font-mono text-gray-600 line-clamp-1 max-w-[200px] hidden md:block">
                   Validando parâmetros hídricos e espaciais...
                </p>
                {step < 8 ? (
                   <button 
                     onClick={() => {
                       if (step === 7) {
                         const currentSurvey: TechnicalSurvey = {
                           unitId: unit.id,
                           inspectorId: auth.currentUser?.uid || '',
                           timestamp: new Date().toISOString(),
                           territorial: { occupiedArea: parseFloat(formData.occupiedArea), landscapeIntegrity: parseInt(formData.landscapeIntegrity) },
                           hydric: { meterReading: 0, observedLeaks: formData.observedLeaks, waterPressure: formData.waterPressure },
                           waste: { volumeKG: parseFloat(formData.wasteKG), segregationScore: parseInt(formData.segregationScore), hazardousWaste: formData.hazardousWaste },
                           energy: { kwhReading: parseFloat(formData.kwhReading || '0'), peakDemand: parseFloat(formData.peakDemand), mainGridStable: formData.mainGridStable },
                           risk: { riskCategory: formData.riskCategory, environmentalLiability: formData.liability, riskDetails: formData.riskDetails }
                         };
                         const scoreBreakdown = calculatePredictiveScore(currentSurvey);
                         setPredictedScore(scoreBreakdown.total);
                       }
                       setStep(s => s + 1);
                     }}
                     className="group flex items-center gap-3 bg-white/5 hover:bg-emerald-500 hover:text-white border border-white/10 hover:border-emerald-500 px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-black/20"
                   >
                     Próxima Fase
                     <ChevronRight size={16} className="text-emerald-500 group-hover:text-white transition-colors" />
                   </button>
                ) : (
                   <button 
                     onClick={handleSubmit}
                     disabled={loading}
                     className="flex items-center gap-3 bg-emerald-500 text-white px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                   >
                     {loading ? 'Sincronizando Mesh...' : 'Sinalizar Finalização'}
                     <CheckCircle2 size={18} />
                   </button>
                )}
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BrainCircuit({ className, size }: { className?: string, size?: number }) {
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
      <path d="M12 4.5V2" />
      <path d="M18 7.5 19.4 6" />
      <path d="M22 12h-2.5" />
      <path d="M18 16.5 19.4 18" />
      <path d="M12 19.5V22" />
      <path d="M6 16.5 4.6 18" />
      <path d="M2 12h2.5" />
      <path d="M6 7.5 4.6 6" />
      <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <circle cx="12" cy="12" r="2" />
    </svg>
   )
}
