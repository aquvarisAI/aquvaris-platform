import React from 'react';
import { logout } from '../lib/firebase';
import type { AccessStatus } from '../lib/access';
import type { User } from 'firebase/auth';

interface Props {
  user: User;
  status: AccessStatus;
}

const STATUS_CONFIG = {
  pending: {
    icon: '⏳',
    title: 'Solicitação recebida',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    message: 'Sua solicitação de acesso foi registrada e está sendo analisada. Você receberá um retorno em breve.',
  },
  rejected: {
    icon: '✕',
    title: 'Acesso não autorizado',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    message: 'Sua solicitação não foi aprovada. Entre em contato com a equipe Aquvaris para mais informações.',
  },
};

export function AccessGate({ user, status }: Props) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

  return (
    <div className="min-h-screen w-full bg-[#080C14] flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-none">AQUVARIS AI</p>
          <p className="text-emerald-400 text-[10px] tracking-widest font-mono">INTELLIGENCE SYSTEM</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-[#0B1118] border border-white/10 rounded-2xl p-8 text-center shadow-2xl">
        {user.photoURL && (
          <img src={user.photoURL} alt={user.displayName || ''} className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-white/10" />
        )}
        <p className="text-white font-semibold text-base mb-1">{user.displayName}</p>
        <p className="text-slate-400 text-sm mb-6 font-mono">{user.email}</p>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${cfg.bg} mb-6`}>
          <span className="text-lg">{cfg.icon}</span>
          <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.title}</span>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed mb-8">{cfg.message}</p>

        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-mono">O que é a Aquvaris AI</p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Plataforma de inteligência ambiental operacional — score ESG por unidade, protocolo de vistoria técnica e diagnóstico por IA.
          </p>
          <a href="https://aquvaris-platform.vercel.app" className="inline-block mt-3 text-emerald-400 text-xs font-mono hover:underline">
            aquvaris-platform.vercel.app ↗
          </a>
        </div>

        <button onClick={() => logout()} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm font-mono hover:bg-white/10 transition-all">
          Sair da conta
        </button>
      </div>

      <p className="text-slate-600 text-xs mt-8 font-mono">Dúvidas? contato@aquvaris.com.br</p>
    </div>
  );
}
