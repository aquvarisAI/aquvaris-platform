// ============================================================
// src/types/crm.ts
// Aquvaris AI — CRM Types
// ============================================================

import { Timestamp } from 'firebase/firestore';

export type LeadStatus =
  | 'prospeccao'
  | 'contato'
  | 'oportunidade'
  | 'reuniao'
  | 'proposta'
  | 'contrato'
  | 'perdido'
  | 'inativo';

export type LeadTemperature = 'frio' | 'morno' | 'quente';

export type LeadOrigin =
  | 'linkedin'
  | 'indicacao'
  | 'prospeccao_ativa'
  | 'evento'
  | 'inbound'
  | 'outro';

export type InteractionType =
  | 'ligacao'
  | 'email'
  | 'whatsapp'
  | 'reuniao'
  | 'linkedin'
  | 'proposta_enviada'
  | 'contrato_assinado'
  | 'outro';

export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type CompanySegment =
  | 'industrial'
  | 'imobiliario'
  | 'governo'
  | 'consultoria_ambiental'
  | 'energia'
  | 'agro'
  | 'outro';

export interface Lead {
  id: string;
  nome: string;
  cargo?: string;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  linkedin?: string;
  empresaId?: string;
  empresaNome?: string;
  segmento?: CompanySegment;
  cidade?: string;
  estado?: string;
  status: LeadStatus;
  temperatura: LeadTemperature;
  origem: LeadOrigin;
  responsavelId: string;
  responsavelNome: string;
  dorAmbiental?: string;
  dadosDisponiveis?: string;
  solucaoAquvaris?: string;
  riscoAmbientalRegiao?: 'baixo' | 'medio' | 'alto' | 'critico';
  ultimaInteracao?: Timestamp;
  proximaAcao?: string;
  proximaAcaoData?: Timestamp;
  valorEstimado?: number;
  observacoes?: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  criadoPor: string;
}

export interface Company {
  id: string;
  nome: string;
  cnpj?: string;
  segmento: CompanySegment;
  cidade?: string;
  estado?: string;
  site?: string;
  telefone?: string;
  descricao?: string;
  possuiLicencaAmbiental?: boolean;
  tipoEmissao?: string[];
  regiaoMonitorada?: boolean;
  leadsIds?: string[];
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
}

export interface Interaction {
  id: string;
  leadId: string;
  tipo: InteractionType;
  titulo: string;
  descricao?: string;
  data: Timestamp;
  duracao?: number;
  resultado?: string;
  proximoPasso?: string;
  usuarioId: string;
  usuarioNome: string;
  criadoEm: Timestamp;
}

export interface Task {
  id: string;
  leadId?: string;
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  prioridade: TaskPriority;
  dataVencimento?: Timestamp;
  responsavelId: string;
  responsavelNome: string;
  criadoEm: Timestamp;
  atualizadoEm: Timestamp;
  concluidaEm?: Timestamp;
}

export interface PipelineStage {
  id: LeadStatus;
  label: string;
  cor: string;
  ordem: number;
  descricao: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'prospeccao',   label: 'Prospecção',   cor: '#6B7280', ordem: 1, descricao: 'Lead identificado, ainda não contatado' },
  { id: 'contato',      label: 'Contato',      cor: '#3B82F6', ordem: 2, descricao: 'Primeiro contato realizado' },
  { id: 'oportunidade', label: 'Oportunidade', cor: '#8B5CF6', ordem: 3, descricao: 'Interesse confirmado, dor mapeada' },
  { id: 'reuniao',      label: 'Reunião',      cor: '#F59E0B', ordem: 4, descricao: 'Reunião agendada ou realizada' },
  { id: 'proposta',     label: 'Proposta',     cor: '#10B981', ordem: 5, descricao: 'Proposta enviada' },
  { id: 'contrato',     label: 'Contrato',     cor: '#00A878', ordem: 6, descricao: 'Contrato assinado' },
  { id: 'perdido',      label: 'Perdido',      cor: '#EF4444', ordem: 7, descricao: 'Negociação encerrada sem conversão' },
  { id: 'inativo',      label: 'Inativo',      cor: '#9CA3AF', ordem: 8, descricao: 'Lead em pausa' },
];

export interface CRMUser {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'analista' | 'viewer';
  ativo: boolean;
  criadoEm: Timestamp;
}
