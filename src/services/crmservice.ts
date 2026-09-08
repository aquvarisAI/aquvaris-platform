// ============================================================
// src/services/crmService.ts
// Aquvaris AI — CRM Service (Firebase/Firestore)
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Lead, Company, Interaction, Task, LeadStatus } from '../types/crm';

// ── COLLECTIONS ────────────────────────────────────────────
const LEADS         = 'leads';
const COMPANIES     = 'companies';
const INTERACTIONS  = 'interactions';
const TASKS         = 'tasks';

// ══════════════════════════════════════════════════════════
// LEADS
// ══════════════════════════════════════════════════════════

export async function createLead(data: Omit<Lead, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<string> {
  const ref = await addDoc(collection(db, LEADS), {
    ...data,
    criadoEm: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  });
  return ref.id;
}

export async function getLead(id: string): Promise<Lead | null> {
  const snap = await getDoc(doc(db, LEADS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Lead;
}

export async function getLeads(filters?: {
  status?: LeadStatus;
  responsavelId?: string;
}): Promise<Lead[]> {
  let q = query(collection(db, LEADS), orderBy('atualizadoEm', 'desc'));

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.responsavelId) {
    q = query(q, where('responsavelId', '==', filters.responsavelId));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
}

export async function updateLead(id: string, data: Partial<Omit<Lead, 'id' | 'criadoEm'>>): Promise<void> {
  await updateDoc(doc(db, LEADS, id), {
    ...data,
    atualizadoEm: Timestamp.now(),
  });
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  await updateDoc(doc(db, LEADS, id), {
    status,
    atualizadoEm: Timestamp.now(),
  });
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, LEADS, id));
}

// Listener em tempo real para o kanban
export function subscribeToLeads(
  callback: (leads: Lead[]) => void
): Unsubscribe {
  const q = query(collection(db, LEADS), orderBy('atualizadoEm', 'desc'));
  return onSnapshot(q, snap => {
    const leads = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
    callback(leads);
  });
}

// ══════════════════════════════════════════════════════════
// COMPANIES
// ══════════════════════════════════════════════════════════

export async function createCompany(data: Omit<Company, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<string> {
  const ref = await addDoc(collection(db, COMPANIES), {
    ...data,
    criadoEm: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  });
  return ref.id;
}

export async function getCompanies(): Promise<Company[]> {
  const snap = await getDocs(query(collection(db, COMPANIES), orderBy('nome')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Company));
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<void> {
  await updateDoc(doc(db, COMPANIES, id), {
    ...data,
    atualizadoEm: Timestamp.now(),
  });
}

// ══════════════════════════════════════════════════════════
// INTERACTIONS
// ══════════════════════════════════════════════════════════

export async function createInteraction(
  data: Omit<Interaction, 'id' | 'criadoEm'>
): Promise<string> {
  const ref = await addDoc(collection(db, INTERACTIONS), {
    ...data,
    criadoEm: Timestamp.now(),
  });

  // Atualiza ultimaInteracao no lead
  await updateDoc(doc(db, LEADS, data.leadId), {
    ultimaInteracao: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  });

  return ref.id;
}

export async function getInteractionsByLead(leadId: string): Promise<Interaction[]> {
  const q = query(
    collection(db, INTERACTIONS),
    where('leadId', '==', leadId),
    orderBy('data', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Interaction));
}

// ══════════════════════════════════════════════════════════
// TASKS
// ══════════════════════════════════════════════════════════

export async function createTask(
  data: Omit<Task, 'id' | 'criadoEm' | 'atualizadoEm'>
): Promise<string> {
  const ref = await addDoc(collection(db, TASKS), {
    ...data,
    criadoEm: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  });
  return ref.id;
}

export async function getTasks(filters?: {
  responsavelId?: string;
  leadId?: string;
  status?: string;
}): Promise<Task[]> {
  let q = query(collection(db, TASKS), orderBy('dataVencimento', 'asc'));

  if (filters?.responsavelId) {
    q = query(q, where('responsavelId', '==', filters.responsavelId));
  }
  if (filters?.leadId) {
    q = query(q, where('leadId', '==', filters.leadId));
  }
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
}

export async function updateTask(id: string, data: Partial<Task>): Promise<void> {
  await updateDoc(doc(db, TASKS, id), {
    ...data,
    atualizadoEm: Timestamp.now(),
  });
}

export async function completeTask(id: string): Promise<void> {
  await updateDoc(doc(db, TASKS, id), {
    status: 'concluida',
    concluidaEm: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  });
}

// ══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════

export async function getCRMStats(): Promise<{
  totalLeads: number;
  leadsPorStatus: Record<LeadStatus, number>;
  tarefasPendentes: number;
  valorPipelineTotal: number;
}> {
  const [leadsSnap, tasksSnap] = await Promise.all([
    getDocs(collection(db, LEADS)),
    getDocs(query(collection(db, TASKS), where('status', '==', 'pendente'))),
  ]);

  const leads = leadsSnap.docs.map(d => d.data() as Lead);

  const leadsPorStatus = leads.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<LeadStatus, number>);

  const valorPipelineTotal = leads
    .filter(l => l.valorEstimado && l.status !== 'perdido' && l.status !== 'inativo')
    .reduce((sum, l) => sum + (l.valorEstimado || 0), 0);

  return {
    totalLeads: leads.length,
    leadsPorStatus,
    tarefasPendentes: tasksSnap.size,
    valorPipelineTotal,
  };
}
