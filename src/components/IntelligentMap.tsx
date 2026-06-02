import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { MapPin, Building2, Activity, AlertTriangle, ShieldCheck, Shield, ShieldAlert, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UnitIntelligence, EnvironmentalRisk } from '../types';
import { cn } from '../lib/utils';

interface IntelligentMapProps {
  units: UnitIntelligence[];
  onSelectUnit: (unit: UnitIntelligence) => void;
}

const RISK_CONFIG: Record<EnvironmentalRisk, {
  label: string;
  color: string;
  bg: string;
  border: string;
  pin: string;
  glow: string;
}> = {
  [EnvironmentalRisk.LOW]: {
    label: 'Baixo Risco',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    pin: '#10B981',
    glow: 'shadow-emerald-500/40',
  },
  [EnvironmentalRisk.MEDIUM]: {
    label: 'Risco Médio',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    pin: '#F59E0B',
    glow: 'shadow-amber-500/40',
  },
  [EnvironmentalRisk.HIGH]: {
    label: 'Alto Risco',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    pin: '#F97316',
    glow: 'shadow-orange-500/40',
  },
  [EnvironmentalRisk.CRITICAL]: {
    label: 'Crítico',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    pin: '#EF4444',
    glow: 'shadow-red-500/40',
  },
};

const GOOGLE_MAPS_API_KEY = (window as any).process?.env?.GOOGLE_MAPS_PLATFORM_KEY || '';

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f3a4f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2137' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a2a3a' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#10B981' }] },
  { featureType: 'administrative.province', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
];

export function IntelligentMap({ units, onSelectUnit }: IntelligentMapProps) {
  const [selectedUnit, setSelectedUnit] = useState<UnitIntelligence | null>(null);
  const [filterRisk, setFilterRisk] = useState<EnvironmentalRisk | 'all'>('all');

  const centerLat = units.reduce((acc, u) => acc + u.lat, 0) / units.length;
  const centerLng = units.reduce((acc, u) => acc + u.lng, 0) / units.length;

  const filteredUnits = filterRisk === 'all'
    ? units
    : units.filter(u => u.risk === filterRisk);

  const counts = {
    all: units.length,
    [EnvironmentalRisk.LOW]: units.filter(u => u.risk === EnvironmentalRisk.LOW).length,
    [EnvironmentalRisk.MEDIUM]: units.filter(u => u.risk === EnvironmentalRisk.MEDIUM).length,
    [EnvironmentalRisk.HIGH]: units.filter(u => u.risk === EnvironmentalRisk.HIGH).length,
    [EnvironmentalRisk.CRITICAL]: units.filter(u => u.risk === EnvironmentalRisk.CRITICAL).length,
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Subheader */}
      <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Mapa Inteligente</h1>
          <p className="text-xs text-slate-400 mt-0.5">Monitoramento geoespacial em tempo real — {units.length} unidades mapeadas</p>
        </div>

        {/* Filtros de risco */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterRisk('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
              filterRisk === 'all'
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
            )}
          >
            Todos ({counts.all})
          </button>
          {Object.values(EnvironmentalRisk).map((risk) => {
            const cfg = RISK_CONFIG[risk];
            return (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk === filterRisk ? 'all' : risk)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all',
                  filterRisk === risk
                    ? cn(cfg.bg, cfg.border, cfg.color)
                    : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                )}
              >
                {cfg.label} ({counts[risk]})
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <Map
              defaultCenter={{ lat: centerLat || -15.7942, lng: centerLng || -47.8822 }}
              defaultZoom={10}
              mapId="aquvaris-map"
              styles={MAP_STYLE as any}
              disableDefaultUI={false}
              className="w-full h-full"
            >
              {filteredUnits.map((unit) => {
                const cfg = RISK_CONFIG[unit.risk];
                return (
                  <AdvancedMarker
                    key={unit.id}
                    position={{ lat: unit.lat, lng: unit.lng }}
                    onClick={() => setSelectedUnit(unit)}
                  >
                    <div
                      className={cn(
                        'relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-lg cursor-pointer transition-transform hover:scale-110',
                        cfg.bg, cfg.border,
                        `shadow-lg ${cfg.glow}`
                      )}
                      style={{ borderColor: cfg.pin, boxShadow: `0 0 16px ${cfg.pin}66` }}
                    >
                      <Building2 size={18} style={{ color: cfg.pin }} />
                      {unit.alerts.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white">
                          {unit.alerts.length}
                        </div>
                      )}
                    </div>
                  </AdvancedMarker>
                );
              })}

              {selectedUnit && (
                <InfoWindow
                  position={{ lat: selectedUnit.lat, lng: selectedUnit.lng }}
                  onCloseClick={() => setSelectedUnit(null)}
                >
                  <div className="bg-[#0F172A] p-0 rounded-xl min-w-[220px]">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-sm text-white uppercase tracking-tight leading-tight">{selectedUnit.name}</p>
                        <button onClick={() => setSelectedUnit(null)}>
                          <X size={14} className="text-slate-500" />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">{selectedUnit.address}</p>
                      <div className="flex items-center justify-between">
                        <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border', RISK_CONFIG[selectedUnit.risk].bg, RISK_CONFIG[selectedUnit.risk].border, RISK_CONFIG[selectedUnit.risk].color)}>
                          {RISK_CONFIG[selectedUnit.risk].label}
                        </span>
                        <span className={cn('text-lg font-bold font-mono', RISK_CONFIG[selectedUnit.risk].color)}>
                          {selectedUnit.currentScore}<span className="text-xs text-slate-500">/100</span>
                        </span>
                      </div>
                      {selectedUnit.alerts.length > 0 && (
                        <p className="text-[9px] text-amber-400 font-mono">⚠ {selectedUnit.alerts.length} alerta{selectedUnit.alerts.length !== 1 ? 's' : ''} ativo{selectedUnit.alerts.length !== 1 ? 's' : ''}</p>
                      )}
                      <button
                        onClick={() => { onSelectUnit(selectedUnit); setSelectedUnit(null); }}
                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-all"
                      >
                        Ver Detalhes <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>

          {/* Legend overlay */}
          <div className="absolute bottom-6 left-6 bg-[#0B1118]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-2">
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">Legenda de Risco</p>
            {Object.values(EnvironmentalRisk).map((risk) => (
              <div key={risk} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_CONFIG[risk].pin }} />
                <span className="text-[10px] font-mono text-slate-400">{RISK_CONFIG[risk].label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar com lista */}
        <div className="w-80 border-l border-white/5 bg-[#0B1118] flex flex-col overflow-hidden shrink-0">
          <div className="px-6 py-4 border-b border-white/5">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {filteredUnits.length} unidade{filteredUnits.length !== 1 ? 's' : ''} {filterRisk !== 'all' ? `— ${RISK_CONFIG[filterRisk as EnvironmentalRisk].label}` : 'monitoradas'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredUnits.map((unit) => {
              const cfg = RISK_CONFIG[unit.risk];
              const isSelected = selectedUnit?.id === unit.id;
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(isSelected ? null : unit)}
                  className={cn(
                    'w-full px-6 py-4 border-b border-white/5 flex items-start gap-4 transition-all text-left hover:bg-white/5',
                    isSelected ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${cfg.pin}20`, border: `1px solid ${cfg.pin}40` }}
                  >
                    <Building2 size={14} style={{ color: cfg.pin }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white uppercase tracking-tight truncate">{unit.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{unit.address}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={cn('text-[9px] font-bold uppercase tracking-widest', cfg.color)}>
                        {cfg.label}
                      </span>
                      <span className={cn('text-[10px] font-mono font-bold', cfg.color)}>
                        {unit.currentScore}/100
                      </span>
                      {unit.alerts.length > 0 && (
                        <span className="text-[9px] text-amber-400 font-mono">⚠ {unit.alerts.length}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats footer */}
          <div className="p-6 border-t border-white/5 space-y-3">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Resumo do Território</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Score Médio</p>
                <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {Math.round(units.reduce((acc, u) => acc + u.currentScore, 0) / (units.length || 1))}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-[9px] font-mono text-slate-500 uppercase">Alertas</p>
                <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
                  {units.reduce((acc, u) => acc + u.alerts.length, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
