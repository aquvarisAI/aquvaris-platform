import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Building2, 
  ClipboardCheck, 
  Droplets, 
  Trash2, 
  AlertTriangle, 
  FileText, 
  BrainCircuit, 
  Settings,
  ShieldCheck,
  ChevronRight,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  onAddUnit: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ onAddUnit, activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Geral', mobileLabel: 'Home' },
    { id: 'surveys', icon: ClipboardCheck, label: 'Vistorias', mobileLabel: 'Vistorias' },
    { id: 'units', icon: Building2, label: 'Empresas', mobileLabel: 'Unidades' },
    { id: 'diagnostics', icon: BrainCircuit, label: 'IA', mobileLabel: 'IA' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfólio', mobileLabel: 'Carreira' },
  ];

  const secondaryItems = [
    { id: 'map', icon: MapIcon, label: 'Mapa Inteligente' },
    { id: 'hydric', icon: Droplets, label: 'Consumo Hídrico' },
    { id: 'waste', icon: Trash2, label: 'Resíduos' },
    { id: 'risks', icon: AlertTriangle, label: 'Riscos' },
    { id: 'reports', icon: FileText, label: 'Relatórios' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-[rgba(255,255,255,0.08)] bg-[#0B1118] flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight leading-none uppercase">Aquvaris AI</h1>
            <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest mt-1">Intelligence System</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {(menuItems as any[]).concat(secondaryItems).map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all group ${
                  activeTab === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-emerald-400' : 'text-gray-500 group-hover:text-white'} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-white/5">
             <button 
               onClick={onAddUnit}
               className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 text-xs font-bold uppercase tracking-wider"
             >
               <Building2 size={16} />
               Nova Unidade
             </button>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#080C14]">
          <button className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors w-full group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform" />
            <span className="text-xs font-medium">Configurações</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#0B1118]/90 backdrop-blur-xl border-t border-white/10 px-4 flex items-center justify-around z-50">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1.5 transition-all ${
              activeTab === item.id ? 'text-emerald-400' : 'text-gray-500'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-emerald-500/10' : 'bg-transparent'
            }`}>
              <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.mobileLabel || item.label}</span>
          </button>
        ))}
        <button 
          onClick={onAddUnit}
          className="bg-emerald-500 text-black p-3 rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          <Building2 size={24} />
        </button>
      </nav>
    </>
  );
}
