
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
  };
  waste: {
    volumeKG: number;
    segregationScore: number;
    hazardousWaste: boolean;
  };
  energy: {
    kwhReading: number;
    peakDemand: number;
    mainGridStable: boolean;
  };
  risk: {
    environmentalLiability: boolean;
    riskCategory: EnvironmentalRisk;
    riskDetails: string;
  };
  territorial: {
    occupiedArea: number;
    landscapeIntegrity: number; // 0-100
  };
  evidenceImages?: string[];
  calculatedScore?: number;
  aiDiagnostic?: string;
  observations?: string;
}

export interface DashboardState {
  totalUnits: number;
  criticalAlerts: number;
  averageScore: number;
  potencialSavings: number;
}
