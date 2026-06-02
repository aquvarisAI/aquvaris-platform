export enum EnvironmentalRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  LEAK = 'LEAK',
  ANOMALY = 'ANOMALY',
  OVERCONSUMPTION = 'OVERCONSUMPTION',
  EFFICIENCY_DROP = 'EFFICIENCY_DROP',
}

export interface EnvironmentalImpact {
  waterSavings: number; // m3
  carbonFootprint: number; // kgCO2
  energyReduction: number; // kWh
}

export interface ConsumptionData {
  timestamp: string;
  value: number;
  expected: number;
}

export interface UnitIntelligence {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  currentScore: number; // 0-100
  risk: EnvironmentalRisk;
  consumptionHistory: ConsumptionData[];
  alerts: Array<{
    type: AlertType;
    message: string;
    severity: EnvironmentalRisk;
    timestamp: string;
  }>;
  lastDiagnostic?: string;
}

export interface TechnicalSurvey {
  id?: string;
  unitId: string;
  inspectorId: string;
  timestamp: string;
  hydric: {
    meterReading: number;
    observedLeaks: boolean;
    waterPressure: 'LOW' | 'NORMAL' | 'HIGH';
    // Campos expandidos para diagnóstico preditivo
    nightlyMeterReading?: number;       // m³ — consumo noturno (detecta vazamentos ocultos)
    expectedDailyConsumption?: number;  // m³ — baseline esperado para a unidade
    pressureBar?: number;               // bar — pressão numérica (referência: 1.0–4.0 bar)
  };
  waste: {
    volumeKG: number;
    segregationScore: number;
    hazardousWaste: boolean;
    // Campos expandidos
    hasHazardousWaste?: boolean;        // alias explícito para uso no geminiService
    expectedVolumeKG?: number;          // kg — volume esperado para comparação
  };
  energy: {
    kwhReading: number;
    peakDemand: number;
    mainGridStable: boolean;
    // Campos expandidos
    expectedKwh?: number;               // kWh — baseline esperado
    networkInstability?: boolean;       // true se houver instabilidade (inverso de mainGridStable)
    occupancyRate?: number;             // 0–100% — taxa de ocupação da unidade
  };
  risk: {
    environmentalLiability: boolean;
    riskCategory: EnvironmentalRisk;
    riskDetails: string;
    // Campo expandido
    hasEnvironmentalLiability?: boolean; // alias explícito para uso no geminiService
  };
  territorial: {
    occupiedArea: number;
    landscapeIntegrity: number;          // 0–100
    // Campos expandidos
    landscapeIntegrityScore?: number;    // alias explícito para uso no geminiService
    proximityToWaterBody?: boolean;      // true se unidade está próxima a corpo hídrico
  };
  evidenceImages?: string[];
  calculatedScore?: number;
  aiDiagnostic?: string;
  observations?: string;
  technicalNotes?: string;               // alias de observations para uso no geminiService
}

export interface DashboardState {
  totalUnits: number;
  criticalAlerts: number;
  averageScore: number;
  potencialSavings: number;
}