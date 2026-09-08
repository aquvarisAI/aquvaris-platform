import { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { subscribeToLeads, updateLeadStatus, createLead } from '../services/crmservice';
import { PIPELINE_STAGES, type Lead, type LeadStatus } from '../types/crm';
import {
  Plus, X, Flame, Thermometer, Snowflake,
  Building2, User, Phone, Mail, ChevronRight,
  AlertCircle, Loader2
} from 'lucide-react';

// ── Mini card de lead no kanban ──────────────────────────────
function LeadCard({
  lead,
  onClick,
  onDrop,
}: {
  lead: Lead;
  onClick: () => void;
  onDrop?: (leadId: string, status: LeadStatus) => void;
}) {
  const tempIcon = {
    quente: <Flame size={12} className="text-rose-400" />,
    morno:  <Thermometer size={12} className="text-amber-400" />,
    frio:   <Snowflake size={12} className="text-sky-400" />,
  }[lead.temperatura];

  const tempColor = {
    quente: 'border-rose-500/30 bg-rose-500/5',
    morno:  'border-amber-500/30 bg-amber-500/5',
    frio:   'border-sky-500/30 bg-sky-500/5',
  }[lead.temperatura];

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('leadId', lead.id)}
      onClick={onClick}
      className={`
        rounded-xl border p-3 cursor-pointer
        transition-all duration-200 group
        hover:border-emerald-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]
        ${tempColor}
      `}
    >
      {/* Nome + temperatura */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-white/90 leading-tight line-clamp-2">
          {lead.nome}
        </span>
        <span className="shrink-0 mt-0.5">{tempIcon}</span>
      </div>

      {/* Empresa */}
      {lead.empresaNome && (
        <div className="flex items-center gap-1.5 mb-2">
          <Building2 size={10} className="text-white/30 shrink-0" />
          <span className="text-[11px] text-white/50 truncate">{lead.empresaNome}</span>
        </div>
      )}

      {/* Dor ambiental */}
      {lead.dorAmbiental && (
        <div className="mt-2 px-2 py-1 rounded-md bg-emerald-500/8 border border-emerald-500/15">
          <p className="text-[10px] text-emerald-400/80 line-clamp-2">{lead.dorAmbiental}</p>
        </div>
      )}

      {/* Valor + próxima ação */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        {lead.valorEstimado ? (
          <span className="font-mono text-[10px] text-emerald-400">
            R$ {lead.valorEstimado.toLocaleString('pt-BR')}
          </span>
        ) : <span />}
        <ChevronRight
          size={12}
          className="text-white/20 group-hover:text-emerald-400 transition-colors"
        />
      </div>
    </div>
  );
}

// ── Coluna do kanban ─────────────────────────────────────────
function KanbanColumn({
  stage,
  leads,
  onLeadClick,
  onDrop,
}: {
  stage: typeof PIPELINE_STAGES[0];
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDrop: (leadId: string, status: LeadStatus) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  const totalValor = leads.reduce((s, l) => s + (l.valorEstimado || 0), 0);

  return (
    <div
      className={`
        flex flex-col rounded-xl border min-w-[220px] w-[220px] shrink-0
        transition-all duration-200
        ${isDragOver
          ? 'border-emerald-500/40 bg-emerald-500/5'
          : 'border-white/6 bg-[#0B1118]'
        }
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const leadId = e.dataTransfer.getData('leadId');
        if (leadId) onDrop(leadId, stage.id);
      }}
    >
      {/* Header da coluna */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: stage.cor }}
            />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
              {stage.label}
            </span>
          </div>
          <span className="font-mono text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
            {leads.length}
          </span>
        </div>
        {totalValor > 0 && (
          <p className="font-mono text-[10px] text-emerald-400/60 mt-1">
            R$ {totalValor.toLocaleString('pt-BR')}
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-hide min-h-[60px]">
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-12 rounded-lg border border-dashed border-white/8">
            <span className="text-[10px] text-white/20">Arraste aqui</span>
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onClick={() => onLeadClick(lead)}
            onDrop={onDrop}
          />
        ))}
      </div>
    </div>
  );
}

// ── Modal: Novo Lead ─────────────────────────────────────────
function NovoLeadModal({
  onClose,
  onSave,
  userId,
}: {
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    cargo: '',
    empresaNome: '',
    email: '',
    telefone: '',
    origem: 'linkedin' as const,
    temperatura: 'frio' as const,
    dorAmbiental: '',
    solucaoAquvaris: '',
    valorEstimado: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.nome.trim()) return;
    setLoading(true);
    try {
      await onSave({
        ...form,
        valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : undefined,
        status: 'prospeccao' as LeadStatus,
        responsavelId: userId,
        responsavelNome: 'Bruna Preschadt',
        criadoPor: userId,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `
    w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2
    text-sm text-white/90 placeholder-white/25
    focus:outline-none focus:border-emerald-500/50 focus:bg-white/8
    transition-all
  `;

  const labelCls = "block text-[11px] font-mono text-white/40 uppercase tracking-wider mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Novo Lead</h2>
            <p className="text-[11px] text-white/40 font-mono mt-0.5">CRM · Aquvaris AI</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-white/50" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Contato */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Nome *</label>
              <input className={inputCls} placeholder="Nome completo"
                value={form.nome} onChange={(e) => set('nome', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Cargo</label>
              <input className={inputCls} placeholder="Gerente de Meio Ambiente"
                value={form.cargo} onChange={(e) => set('cargo', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Empresa</label>
              <input className={inputCls} placeholder="Nome da empresa"
                value={form.empresaNome} onChange={(e) => set('empresaNome', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={inputCls} type="email" placeholder="email@empresa.com"
                value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Telefone</label>
              <input className={inputCls} placeholder="(51) 99999-9999"
                value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
            </div>
          </div>

          {/* Pipeline */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Temperatura</label>
              <select className={inputCls}
                value={form.temperatura} onChange={(e) => set('temperatura', e.target.value)}>
                <option value="frio">❄️ Frio</option>
                <option value="morno">🌡️ Morno</option>
                <option value="quente">🔥 Quente</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Origem</label>
              <select className={inputCls}
                value={form.origem} onChange={(e) => set('origem', e.target.value)}>
                <option value="linkedin">LinkedIn</option>
                <option value="indicacao">Indicação</option>
                <option value="prospeccao_ativa">Prospecção ativa</option>
                <option value="evento">Evento</option>
                <option value="inbound">Inbound</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Inteligência ambiental */}
          <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3 space-y-3">
            <p className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-wider">
              Inteligência Ambiental
            </p>
            <div>
              <label className={labelCls}>Dor ambiental</label>
              <textarea className={inputCls + " resize-none"} rows={2}
                placeholder="Ex: Emissões industriais sem monitoramento estruturado"
                value={form.dorAmbiental} onChange={(e) => set('dorAmbiental', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Solução Aquvaris</label>
              <textarea className={inputCls + " resize-none"} rows={2}
                placeholder="Ex: Dashboard de qualidade do ar + alertas automáticos"
                value={form.solucaoAquvaris} onChange={(e) => set('solucaoAquvaris', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Valor estimado (R$)</label>
              <input className={inputCls} type="number" placeholder="5500"
                value={form.valorEstimado} onChange={(e) => set('valorEstimado', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/10 text-sm text-white/50 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.nome.trim()}
            className="flex-1 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {loading ? 'Salvando...' : 'Criar lead'}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export function CRMKanban({ userId }: { userId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoLeadOpen, setNovoLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    const unsub = subscribeToLeads((data) => {
      setLeads(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const leadsPorStage = (stageId: LeadStatus) =>
    leads.filter((l) => l.status === stageId);

  const handleDrop = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === newStatus) return;
    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => l.id === leadId ? { ...l, status: newStatus } : l)
    );
    try {
      await updateLeadStatus(leadId, newStatus);
    } catch {
      // Reverte se falhar
      setLeads((prev) =>
        prev.map((l) => l.id === leadId ? { ...l, status: lead.status } : l)
      );
    }
  };

  const handleCreate = async (data: any) => {
    await createLead(data);
  };

  // Stats do topo
  const totalLeads = leads.length;
  const valorPipeline = leads
    .filter((l) => !['perdido', 'inativo'].includes(l.status))
    .reduce((s, l) => s + (l.valorEstimado || 0), 0);
  const quentes = leads.filter((l) => l.temperatura === 'quente').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-white">CRM · Pipeline</h2>
          <p className="text-[11px] text-white/40 font-mono">Aquvaris AI · Prospecção comercial</p>
        </div>
        <button
          onClick={() => setNovoLeadOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 transition-colors"
        >
          <Plus size={14} />
          Novo lead
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {[
          { label: 'Total leads', value: totalLeads, mono: true },
          { label: 'Pipeline', value: `R$ ${valorPipeline.toLocaleString('pt-BR')}`, color: 'text-emerald-400' },
          { label: 'Quentes 🔥', value: quentes, color: 'text-rose-400' },
        ].map((s) => (
          <GlassCard key={s.label} className="py-3 px-4">
            <p className="stat-label">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color || 'text-white'} ${s.mono ? 'font-mono' : ''}`}>
              {s.value}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
          {PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsPorStage(stage.id)}
              onLeadClick={setSelectedLead}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Modal novo lead */}
      {novoLeadOpen && (
        <NovoLeadModal
          onClose={() => setNovoLeadOpen(false)}
          onSave={handleCreate}
          userId={userId}
        />
      )}

      {/* Preview do lead selecionado (básico por enquanto) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{selectedLead.nome}</h3>
                {selectedLead.empresaNome && (
                  <p className="text-xs text-white/50 mt-0.5">{selectedLead.empresaNome}</p>
                )}
              </div>
              <button onClick={() => setSelectedLead(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
                <X size={16} className="text-white/50" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              {selectedLead.email && (
                <div className="flex items-center gap-2 text-white/60">
                  <Mail size={12} /> {selectedLead.email}
                </div>
              )}
              {selectedLead.telefone && (
                <div className="flex items-center gap-2 text-white/60">
                  <Phone size={12} /> {selectedLead.telefone}
                </div>
              )}
              {selectedLead.dorAmbiental && (
                <div className="mt-3 p-2 rounded-lg bg-emerald-500/8 border border-emerald-500/15">
                  <p className="text-[10px] text-emerald-400/60 font-mono uppercase mb-1">Dor ambiental</p>
                  <p className="text-xs text-white/70">{selectedLead.dorAmbiental}</p>
                </div>
              )}
              {selectedLead.solucaoAquvaris && (
                <div className="mt-2 p-2 rounded-lg bg-white/3 border border-white/8">
                  <p className="text-[10px] text-white/30 font-mono uppercase mb-1">Solução</p>
                  <p className="text-xs text-white/60">{selectedLead.solucaoAquvaris}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedLead(null)}
              className="w-full mt-4 py-2 rounded-lg border border-white/10 text-sm text-white/50 hover:bg-white/5 transition-colors"
            >
              Fechar
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
}