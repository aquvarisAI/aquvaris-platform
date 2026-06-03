import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Search, LogIn, LogOut } from 'lucide-react';
import { UnitIntelligence, EnvironmentalRisk, AlertType, TechnicalSurvey } from './types';
import { generateEnvironmentalDiagnostic } from './services/geminiService';
import { auth, loginWithGoogle, logout, db, testFirestoreConnection } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Sidebar } from './components/Sidebar';
import { SurveyForm } from './components/SurveyForm';
import { AddUnitForm } from './components/AddUnitForm';
import { MetricCard } from './components/MetricCard';
import { EnvironmentalMap } from './components/EnvironmentalMap';
import { AIDiagnosis } from './components/AIDiagnosis';
import { GlassCard } from './components/ui/GlassCard';
import { SurveyDashboard } from './components/SurveyDashboard';
import { Portfolio } from './components/Portfolio';
import { CompanyDashboard } from './components/CompanyDashboard';
import { IntelligentMap } from './components/IntelligentMap';
import { AIDashboard } from './components/AIDashboard';
import { HydricDashboard } from './components/HydricDashboard';
import { RiskDashboard } from './components/RiskDashboard';
import { WasteDashboard } from './components/WasteDashboard';
import { ReportsDashboard } from './components/ReportsDashboard';
import { AccessGate } from './components/AccessGate';
import { AdminPanel } from './components/AdminPanel';
import { requestAccess, getAccessRequest, isAdminEmail } from './lib/access';
import type { AccessStatus } from './lib/access';

const DEFAULT_MOCK_UNITS: UnitIntelligence[] = [
  {
    id: 'unit-1',
    name: 'Parque Industrial Alfa',
    address: 'Setor Industrial, 102 - Brasília',
    lat: -15.7942,
    lng: -47.8822,
    currentScore: 42,
    risk: EnvironmentalRisk.HIGH,
    consumptionHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: i > 2 && i < 5 ? 150 : (Math.random() * 50 + 40),
      expected: 45
    })),
    alerts: [
      {
        type: AlertType.LEAK,
        message: 'Suspeita de vazamento noturno (02:00 - 05:00)',
        severity: EnvironmentalRisk.HIGH,
        timestamp: '2024-05-06T03:15:00Z'
      }
    ],
    lastDiagnostic: 'Análise preliminar sugere falha em válvula de retenção no setor B.'
  },
  {
    id: 'unit-2',
    name: 'Centro Logístico Beta',
    address: 'Rodovia BR-153, KM 12',
    lat: -15.8200,
    lng: -47.9200,
    currentScore: 88,
    risk: EnvironmentalRisk.LOW,
    consumptionHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: Math.random() * 20 + 10,
      expected: 15
    })),
    alerts: [],
  },
  {
    id: 'unit-3',
    name: 'Centro de Negócios Gama',
    address: 'Av. Paulista, 1500 - SP',
    lat: -15.7500,
    lng: -47.8500,
    currentScore: 65,
    risk: EnvironmentalRisk.MEDIUM,
    consumptionHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: Math.random() * 30 + 30,
      expected: 35
    })),
    alerts: [
      {
        type: AlertType.ANOMALY,
        message: 'Consumo acima da média operacional',
        severity: EnvironmentalRisk.MEDIUM,
        timestamp: '2024-05-06T14:20:00Z'
      }
    ],
  }
];

const TAB_LABELS: Record<string, string> = {
  dashboard:   'Geral',
  surveys:     'Vistorias',
  units:       'Empresas',
  diagnostics: 'IA',
  portfolio:   'Portfólio',
  map:         'Mapa Inteligente',
  hydric:      'Consumo Hídrico',
  waste:       'Resíduos',
  risks:       'Riscos',
  reports:     'Relatórios',
};

export default function App() {
  const [user, setUser]                         = useState<User | null>(null);
  const [units, setUnits]                       = useState<UnitIntelligence[]>(DEFAULT_MOCK_UNITS);
  const [selectedUnit, setSelectedUnit]         = useState<UnitIntelligence | null>(null);
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  const [aiDiagnostic, setAiDiagnostic]         = useState<string | null>(null);
  const [searchTerm, setSearchTerm]             = useState('');
  const [isSurveyOpen, setIsSurveyOpen]         = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen]       = useState(false);
  const [unitSurveys, setUnitSurveys]           = useState<TechnicalSurvey[]>([]);
  const [activeTab, setActiveTab]               = useState('dashboard');
  const [accessStatus, setAccessStatus]         = useState<AccessStatus | 'loading' | 'admin'>('loading');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  useEffect(() => {
    testFirestoreConnection();
    let stopSnapshot: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (stopSnapshot) { stopSnapshot(); stopSnapshot = null; }

      if (currentUser) {
        await requestAccess(
          currentUser.uid,
          currentUser.email!,
          currentUser.displayName || 'Usuário',
          currentUser.photoURL || undefined,
        );

        const access = await getAccessRequest(currentUser.uid);

        if (isAdminEmail(currentUser.email!)) {
          setAccessStatus('admin');
        } else {
          setAccessStatus(access?.status || 'pending');
        }

        if (access?.status === 'approved' || isAdminEmail(currentUser.email!)) {
          const q = query(collection(db, 'units'), where('ownerId', '==', currentUser.uid));
          stopSnapshot = onSnapshot(q, (snapshot) => {
            const fetchedUnits = snapshot.docs.map(d => ({
              id: d.id,
              ...d.data()
            } as UnitIntelligence));
            if (fetchedUnits.length > 0) setUnits(fetchedUnits);
          }, (error) => {
            if (error.message.includes('permissions') && !auth.currentUser) return;
            console.error('Firestore Error:', error);
          });
        }
      } else {
        setAccessStatus('loading');
        setUnits(DEFAULT_MOCK_UNITS);
      }
    });

    return () => { unsubscribe(); if (stopSnapshot) stopSnapshot(); };
  }, []);

  useEffect(() => {
    if (user && selectedUnit && !selectedUnit.id.startsWith('unit-')) {
      const q = query(collection(db, 'surveys'), where('unitId', '==', selectedUnit.id));
      const stop = onSnapshot(q, (snapshot) => {
        setUnitSurveys(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TechnicalSurvey)));
      });
      return () => stop();
    } else {
      setUnitSurveys([]);
    }
  }, [user, selectedUnit]);

  const filteredUnits = useMemo(() => {
    return units.filter(u =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  const getDiagnostic = async () => {
    if (!selectedUnit) return;
    setIsDiagnosticLoading(true);
    const result = await generateEnvironmentalDiagnostic(selectedUnit, {} as any, {} as any);
    setAiDiagnostic(result?.summary || null);
    setIsDiagnosticLoading(false);
  };

  const startSurveyForUnit = (unit: UnitIntelligence) => {
    setSelectedUnit(unit);
    setIsSurveyOpen(true);
  };

  if (user && accessStatus !== 'approved' && accessStatus !== 'admin' && accessStatus !== 'loading') {
    return <AccessGate user={user} status={accessStatus as 'pending' | 'rejected'} />;
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#080C14] text-[#F8FAFC] font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
      <Sidebar
        onAddUnit={() => setIsAddUnitOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative pb-20 lg:pb-0">
        <header className="h-16 lg:h-20 border-b border-white/5 bg-[#0B1118]/80 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-lg lg:text-xl font-bold tracking-tight uppercase leading-none">
              {TAB_LABELS[activeTab] || 'Sistema'}
            </h2>
            <p className="hidden xs:block text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1 opacity-60">Intelligence Hub</p>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden lg:relative lg:group lg:block">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Pesquisar território..."
                className="pl-12 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500/50 outline-none w-72 transition-all placeholder:text-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="hidden lg:block h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 lg:gap-4">
              {user ? (
                <div className="flex items-center gap-2 lg:gap-3 lg:pl-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] font-mono text-emerald-400 leading-none mb-1 uppercase tracking-tighter">Analista</p>
                    <p className="text-sm font-semibold truncate max-w-[120px]">{user.displayName || 'Bruna'}</p>
                  </div>
                  {accessStatus === 'admin' && (
                    <button
                      onClick={() => setIsAdminPanelOpen(true)}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-sm"
                      title="Painel Admin"
                    >
                      ⚙
                    </button>
                  )}
                  <button
                    onClick={() => logout()}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => loginWithGoogle()}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-4 lg:px-5 py-2 rounded-lg text-[10px] lg:text-sm font-bold uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <LogIn size={18} />
                  <span className="hidden xs:inline">Acessar</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-auto p-4 lg:p-8 space-y-6 lg:space-y-8 scrollbar-hide">
            <header className="flex items-center justify-between">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Visão Geral</h1>
                <p className="text-xs lg:text-sm text-slate-400">Panorama ambiental inteligente</p>
              </div>
              <button
                onClick={() => setActiveTab('surveys')}
                className="hidden sm:block rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Inspecionar
              </button>
            </header>

            <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 font-mono">
              <MetricCard title="Empresas" value={units.length.toString()} status="+12%" />
              <MetricCard title="Consumo Hídrico" value="1.8M L" status="-8%" trend="down" />
              <MetricCard title="Risco Amb." value={units.filter(u => u.risk === EnvironmentalRisk.HIGH || u.risk === EnvironmentalRisk.CRITICAL).length.toString()} status="Atenção" trend="up" alert />
              <MetricCard title="Alertas" value={(units.reduce((acc, u) => acc + u.alerts.length, 0) || 15).toString()} status="Ativos" trend="up" alert />
              <MetricCard title="Score Médio" value={`${Math.round(units.reduce((acc, u) => acc + u.currentScore, 0) / units.length)}/100`} status="Bom" />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 overflow-hidden rounded-2xl border border-white/5">
                <EnvironmentalMap />
              </div>
              <GlassCard className="flex flex-col h-[400px] xl:h-auto">
                <h2 className="text-lg font-bold mb-5 tracking-tight">Alertas Recentes</h2>
                <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                  {[
                    { title: "Consumo anômalo", company: "Empresa Metalúrgica X", color: "text-red-400" },
                    { title: "Vazamento noturno", company: "Indústria Y", color: "text-yellow-400" },
                    { title: "Resíduo fora padrão", company: "Química Z", color: "text-emerald-400" },
                    { title: "Efluente acima", company: "Têxtil W", color: "text-red-400" },
                  ].map((alert, index) => (
                    <div key={index} className="rounded-xl bg-white/5 p-4 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-[11px] lg:text-xs font-bold leading-none ${alert.color}`}>{alert.title}</p>
                        <span className="text-[9px] font-mono opacity-30">2m</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter opacity-60 truncate">{alert.company}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setActiveTab('risks')}
                  className="mt-4 w-full py-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest border border-emerald-500/10 rounded-lg hover:bg-emerald-500/5 transition-colors"
                >
                  Ver Incidentes
                </button>
              </GlassCard>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
              <AIDiagnosis diagnostic={aiDiagnostic} onExecute={getDiagnostic} loading={isDiagnosticLoading} />
              <GlassCard>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold tracking-tight">Protocolo Ativo</h2>
                  <button onClick={() => setActiveTab('surveys')} className="text-[9px] font-mono text-emerald-400 hover:underline uppercase tracking-widest">
                    Abrir Auditoria
                  </button>
                </div>
                <div className="space-y-2 cursor-pointer" onClick={() => setActiveTab('surveys')}>
                  {[
                    ["Identificação", "Completo", "text-emerald-400"],
                    ["Território", "Completo", "text-emerald-400"],
                    ["Água", "Em análise", "text-emerald-400"],
                    ["Resíduos", "Pendente", "text-slate-500"],
                  ].map(([layer, status, statusColor], index) => (
                    <div key={index} className="flex items-center justify-between rounded-xl bg-white/5 p-3 lg:p-4 border border-white/5 group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-mono text-emerald-400 border border-white/5 shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-xs lg:text-sm font-semibold text-white uppercase tracking-tight">{layer}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </section>
          </div>
        )}

        {activeTab === 'surveys'     && <SurveyDashboard units={units} onStartSurvey={startSurveyForUnit} />}
        {activeTab === 'units'       && <CompanyDashboard units={units} onAddUnit={() => setIsAddUnitOpen(true)} onSelectUnit={(unit) => { setSelectedUnit(unit); setActiveTab('surveys'); }} />}
        {activeTab === 'diagnostics' && <AIDashboard units={units} onStartSurvey={startSurveyForUnit} />}
        {activeTab === 'map'         && <IntelligentMap units={units} onSelectUnit={(unit) => { setSelectedUnit(unit); setActiveTab('units'); }} />}
        {activeTab === 'hydric'      && <HydricDashboard units={units} />}
        {activeTab === 'waste'       && <WasteDashboard units={units} />}
        {activeTab === 'risks'       && <RiskDashboard units={units} onStartSurvey={startSurveyForUnit} />}
        {activeTab === 'reports'     && <ReportsDashboard units={units} />}
        {activeTab === 'portfolio'   && <Portfolio />}

        {!['dashboard','surveys','units','diagnostics','map','hydric','waste','risks','reports','portfolio'].includes(activeTab) && (
          <div className="flex-1 flex items-center justify-center opacity-30">
            <div className="text-center group">
              <Settings className="mx-auto mb-4 group-hover:rotate-45 transition-transform" size={48} />
              <p className="text-sm font-mono uppercase tracking-[0.4em]">Selecione uma opção no menu</p>
            </div>
          </div>
        )}
      </main>

      {isSurveyOpen && selectedUnit && (
        <SurveyForm
          unit={selectedUnit}
          onClose={() => setIsSurveyOpen(false)}
          onSuccess={async (newSurveyScore) => {
            setIsSurveyOpen(false);
            if (selectedUnit.id && !selectedUnit.id.startsWith('unit-')) {
              const unitRef = doc(db, 'units', selectedUnit.id);
              await updateDoc(unitRef, { currentScore: newSurveyScore });
            }
          }}
        />
      )}

      {isAddUnitOpen && (
        <AddUnitForm onClose={() => setIsAddUnitOpen(false)} onSuccess={() => setIsAddUnitOpen(false)} />
      )}

      {isAdminPanelOpen && user && (
        <AdminPanel currentUser={user} onClose={() => setIsAdminPanelOpen(false)} />
      )}
    </div>
  );
}