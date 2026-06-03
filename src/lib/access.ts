import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AccessStatus = 'pending' | 'approved' | 'rejected';
export type UserRole     = 'admin' | 'company' | 'inspector';
export type PlanType     = 'starter' | 'professional' | 'enterprise' | 'trial';

export interface AccessRequest {
  uid:         string;
  email:       string;
  displayName: string;
  photoURL?:   string;
  status:      AccessStatus;
  role:        UserRole;
  plan:        PlanType;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?:      string;
}

// ─── Emails de admin (você) ───────────────────────────────────────────────────
// Adicione seu email aqui para ter acesso irrestrito ao painel admin
const ADMIN_EMAILS = [
  'bpreschad@gmail.com', // substitua pelo seu email real
];

// ─── Funções públicas ─────────────────────────────────────────────────────────

/** Verifica se um email é admin */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Verifica o status de acesso de um usuário.
 * Retorna null se ainda não solicitou acesso.
 */
export async function getAccessRequest(uid: string): Promise<AccessRequest | null> {
  const snap = await getDoc(doc(db, 'accessRequests', uid));
  if (!snap.exists()) return null;
  const data = snap.data() as Record<string, unknown>;
  return {
    uid:         data.uid         as string,
    email:       data.email       as string,
    displayName: data.displayName as string,
    photoURL:    data.photoURL    as string | undefined,
    status:      data.status      as AccessStatus,
    role:        data.role        as UserRole,
    plan:        data.plan        as PlanType,
    requestedAt: data.requestedAt instanceof Timestamp
                   ? data.requestedAt.toDate().toISOString()
                   : data.requestedAt as string,
    reviewedAt:  data.reviewedAt instanceof Timestamp
                   ? data.reviewedAt.toDate().toISOString()
                   : data.reviewedAt as string | undefined,
    reviewedBy:  data.reviewedBy as string | undefined,
    notes:       data.notes      as string | undefined,
  };
}

/**
 * Cria ou atualiza uma solicitação de acesso.
 * Chamado automaticamente após o primeiro login.
 */
export async function requestAccess(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
): Promise<void> {
  const existing = await getAccessRequest(uid);
  if (existing) return; // já solicitou, não sobrescreve

  // Admins são aprovados automaticamente
  const isAdmin = isAdminEmail(email);

  await setDoc(doc(db, 'accessRequests', uid), {
    uid,
    email,
    displayName,
    photoURL: photoURL || '',
    status:      isAdmin ? 'approved' : 'pending',
    role:        isAdmin ? 'admin'    : 'company',
    plan:        isAdmin ? 'enterprise' : 'trial',
    requestedAt: serverTimestamp(),
    reviewedAt:  isAdmin ? serverTimestamp() : null,
    reviewedBy:  isAdmin ? 'system' : null,
  });
}

/**
 * Aprova um usuário (chamado pelo admin).
 */
export async function approveUser(
  uid: string,
  role: UserRole,
  plan: PlanType,
  reviewerEmail: string,
  notes?: string,
): Promise<void> {
  await updateDoc(doc(db, 'accessRequests', uid), {
    status:     'approved',
    role,
    plan,
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerEmail,
    notes:      notes || '',
  });
}

/**
 * Rejeita um usuário (chamado pelo admin).
 */
export async function rejectUser(
  uid: string,
  reviewerEmail: string,
  notes?: string,
): Promise<void> {
  await updateDoc(doc(db, 'accessRequests', uid), {
    status:     'rejected',
    reviewedAt: serverTimestamp(),
    reviewedBy: reviewerEmail,
    notes:      notes || '',
  });
}

/**
 * Lista todas as solicitações de acesso (apenas para admin).
 */
export async function listAccessRequests(): Promise<AccessRequest[]> {
  const snap = await getDocs(
    query(collection(db, 'accessRequests'), orderBy('requestedAt', 'desc'))
  );
  return snap.docs.map(d => {
    const data = d.data() as Record<string, unknown>;
    return {
      uid:         data.uid         as string,
      email:       data.email       as string,
      displayName: data.displayName as string,
      photoURL:    data.photoURL    as string | undefined,
      status:      data.status      as AccessStatus,
      role:        data.role        as UserRole,
      plan:        data.plan        as PlanType,
      requestedAt: data.requestedAt instanceof Timestamp
                     ? data.requestedAt.toDate().toISOString()
                     : data.requestedAt as string,
      reviewedAt:  data.reviewedAt instanceof Timestamp
                     ? data.reviewedAt.toDate().toISOString()
                     : data.reviewedAt as string | undefined,
      reviewedBy:  data.reviewedBy as string | undefined,
      notes:       data.notes      as string | undefined,
    };
  });
}
