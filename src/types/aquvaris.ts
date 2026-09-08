// ─── Tipos espelhando firebase-blueprint.json ────────────────────────────────

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type WaterPressure = 'LOW' | 'NORMAL' | 'HIGH';

// ── Unidade ──────────────────────────────────────────────────────────────────
export interface Unit {
  id?: string;           // Firestore document ID (preenchido após leitura)
  name: string;
  address: string;
  lat: number;
  lng: number;
  currentScore: number;  // 0–100
  risk: RiskLevel;
  ownerId: string;       // UID do usuário proprietário
  createdAt?: string;    // ISO date-time (opcional, adicionado na escrita)
}

// ── Survey ────────────────────────────────────────────────────────────────────
export interface HydricData {
  meterReading?: number;
  observedLeaks?: boolean;
  waterPressure?: WaterPressure;
}

export interface WasteData {
  volumeKG?: number;
  segregationScore?: number;  // 0–100
  hazardousWaste?: boolean;
}

export interface EnergyData {
  kwhReading?: number;
  peakDemand?: number;
  mainGridStable?: boolean;
}

export interface RiskData {
  environmentalLiability?: boolean;
  riskCategory?: RiskLevel;
  riskDetails?: string;
}

export interface TerritorialData {
  occupiedArea?: number;        // m²
  landscapeIntegrity?: number;  // 0–100
}

export interface Survey {
  id?: string;                   // Firestore document ID
  unitId: string;
  inspectorId: string;
  timestamp: string;             // ISO date-time
  hydric?: HydricData;
  waste?: WasteData;
  energy?: EnergyData;
  risk?: RiskData;
  territorial?: TerritorialData;
  evidenceImages?: string[];     // URLs ou base64
  calculatedScore?: number;      // 0–100
  aiDiagnostic?: string;
}
