import { useState } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindowF,
  useJsApiLoader,
} from "@react-google-maps/api";

import { GlassCard } from "./ui/GlassCard";

type RiskLevel = "normal" | "attention" | "critical";

interface Unit {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  risk: RiskLevel;
}

const units: Unit[] = [
  {
    id: 1,
    name: "Empresa Verde",
    address: "Centro - Santa Cruz do Sul",
    lat: -29.7175,
    lng: -52.4258,
    risk: "normal",
  },
  {
    id: 2,
    name: "Indústria Norte",
    address: "Distrito Industrial",
    lat: -29.705,
    lng: -52.448,
    risk: "attention",
  },
  {
    id: 3,
    name: "Metalúrgica Horizonte",
    address: "Zona Leste",
    lat: -29.729,
    lng: -52.401,
    risk: "critical",
  },
];

const center = {
  lat: -29.7175,
  lng: -52.4258,
};

function markerColor(risk: RiskLevel) {
  switch (risk) {
    case "normal":
      return "http://maps.google.com/mapfiles/ms/icons/green-dot.png";

    case "attention":
      return "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";

    case "critical":
      return "http://maps.google.com/mapfiles/ms/icons/red-dot.png";

    default:
      return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
  }
}

export function EnvironmentalMap() {
  const [selected, setSelected] = useState<Unit | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  return (
    <GlassCard className="overflow-hidden">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">
          Mapa Inteligente Ambiental
        </h2>

        <p className="text-sm text-slate-400">
          Empresas monitoradas por nível de risco
        </p>
      </div>

      {!isLoaded ? (
        <div className="h-[500px] flex items-center justify-center text-slate-400">
          Carregando mapa...
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "500px",
          }}
          center={center}
          zoom={12}
        >
          {units.map((unit) => (
            <MarkerF
              key={unit.id}
              position={{
                lat: unit.lat,
                lng: unit.lng,
              }}
              icon={markerColor(unit.risk)}
              onClick={() => setSelected(unit)}
            />
          ))}

          {selected && (
            <InfoWindowF
              position={{
                lat: selected.lat,
                lng: selected.lng,
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="min-w-[200px]">
                <h3 className="font-bold">
                  {selected.name}
                </h3>

                <p>{selected.address}</p>

                <p className="mt-2">
                  <strong>Risco:</strong>{" "}
                  {selected.risk}
                </p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      )}

      <div className="mt-4 flex gap-4 text-xs text-slate-300">
        <span className="text-green-400">● Normal</span>
        <span className="text-yellow-400">● Atenção</span>
        <span className="text-red-400">● Crítico</span>
      </div>
    </GlassCard>
  );
}