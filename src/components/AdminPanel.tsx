import React, { useEffect, useState } from 'react';
import {
  listAccessRequests,
  approveUser,
  rejectUser,
  type AccessRequest,
  type UserRole,
  type PlanType,
} from '../lib/access';
import type { User } from 'firebase/auth';

interface Props {
  currentUser: User;
  onClose: () => void;
}

const STATUS_COLORS = {
  pending:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const STATUS_LABELS = {
  pending:  'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

export function AdminPanel({ currentUser, onClose }: Props) {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [acting, setActing]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await listAccessRequests();
    setRequests(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (uid: string, role: UserRole = 'company', plan: PlanType = 'starter') => {
    setActing(uid);
    await approveUser(uid, role, plan, currentUser.email!);
    await load();
    setActing(null);
  };

  const handleReject = async (uid: string) => {
    setActing(uid);
    await rejectUser(uid, currentUser.email!);
    await load();
    setActing(null);
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts   = { pending: requests.filter(r => r.status === 'pending').length, approved: requests.filter(r => r.status === 'approved').length, rejected: requests.filter(r => r.status === 'rejected').length };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center pt-8 px-4 pb-8 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0B1118] border border-white/10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-lg">Painel Admin — Controle de Acesso</h2>
            <p className="text-slate-400 text-xs font-mono mt-1">{requests.length} solicitações no total</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center text-lg">✕</button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 p-4 border-b border-white/5">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono border transition-all ${filter === f ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
            >
              {f === 'all' ? `Todos (${requests.length})` : f === 'pending' ? `Pendentes (${counts.pending})` : f === 'approved' ? `Aprovados (${counts.approved})` : `Rejeitados (${counts.rejected})`}
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="p-4 space-y-3">
          {loading && <p className="text-slate-500 text-sm text-center py-8 font-mono">Carregando...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8 font-mono">Nenhuma solicitação {filter !== 'all' ? STATUS_LABELS[filter as keyof typeof STATUS_LABELS].toLowerCase() : ''}</p>
          )}
          {filtered.map(req => (
            <div key={req.uid} className="bg-white/5 border border-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {req.photoURL && <img src={req.photoURL} alt="" className="w-10 h-10 rounded-full shrink-0 border border-white/10" />}
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{req.displayName}</p>
                    <p className="text-slate-400 text-xs font-mono truncate">{req.email}</p>
                    <p className="text-slate-600 text-xs font-mono mt-1">
                      Solicitado: {new Date(req.requestedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full border text-xs font-mono ${STATUS_COLORS[req.status]}`}>
                    {STATUS_LABELS[req.status]}
                  </span>
                  {req.plan && req.status === 'approved' && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono capitalize">{req.plan}</span>
                  )}
                </div>
              </div>

              {/* Ações — só para pendentes */}
              {req.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleApprove(req.uid, 'company', 'starter')}
                    disabled={acting === req.uid}
                    className="flex-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {acting === req.uid ? 'Processando...' : '✓ Aprovar — Starter'}
                  </button>
                  <button
                    onClick={() => handleApprove(req.uid, 'company', 'trial')}
                    disabled={acting === req.uid}
                    className="flex-1 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono hover:bg-blue-500/20 transition-all disabled:opacity-50"
                  >
                    ✓ Aprovar — Trial
                  </button>
                  <button
                    onClick={() => handleReject(req.uid)}
                    disabled={acting === req.uid}
                    className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    ✕ Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
