import React, { useState } from 'react';
import { X, Building2, Navigation, MapPin, Search, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { EnvironmentalRisk } from '../types';

interface AddUnitFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_KEY || 
  (window as any).process?.env?.GOOGLE_MAPS_PLATFORM_KEY || '';

export function AddUnitForm({ onClose, onSuccess }: AddUnitFormProps) {
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: ''
  });

  const handleGeocode = async () => {
    if (!formData.address.trim()) return;
    setGeocoding(true);
    setGeocodeStatus('idle');

    try {
      const encoded = encodeURIComponent(formData.address);
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${GOOGLE_MAPS_API_KEY}&language=pt-BR`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;
        setFormData(prev => ({
          ...prev,
          address: formattedAddress,
          lat: lat.toFixed(6),
          lng: lng.toFixed(6),
        }));
        setGeocodeStatus('success');
      } else {
        setGeocodeStatus('error');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setGeocodeStatus('error');
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!formData.lat || !formData.lng) {
      setGeocodeStatus('error');
      return;
    }
    setLoading(true);

    try {
      await addDoc(collection(db, 'units'), {
        name: formData.name,
        address: formData.address,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        currentScore: 100,
        risk: EnvironmentalRisk.LOW,
        ownerId: auth.currentUser.uid,
        alerts: [],
        consumptionHistory: Array.from({ length: 24 }, (_, i) => ({
          timestamp: `${i}:00`,
          value: Math.random() * 30 + 10,
          expected: 25
        }))
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding unit:', error);
    } finally {
      setLoading(false);
    }
  };

  const coordsReady = formData.lat && formData.lng;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#080C14]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0F172A] w-full max-w-lg border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase">Nova Empresa</h2>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none mt-1">Mapeamento Territorial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Identificação Operacional
            </label>
            <div className="relative group">
              <input 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold"
                placeholder="Ex: Hub de Logística Beta"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
            </div>
          </div>

          {/* Endereço + Botão Geocode */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Endereço
            </label>
            <div className="relative group">
              <textarea 
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium h-20 resize-none"
                placeholder="Ex: Av. Paulista, 1500 - São Paulo, SP"
                value={formData.address}
                onChange={(e) => {
                  setFormData({...formData, address: e.target.value, lat: '', lng: ''});
                  setGeocodeStatus('idle');
                }}
              />
              <MapPin className="absolute left-4 top-4 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
            </div>

            <button
              type="button"
              onClick={handleGeocode}
              disabled={geocoding || !formData.address.trim()}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl py-3 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-40"
            >
              {geocoding ? (
                <>
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  Localizando coordenadas...
                </>
              ) : (
                <>
                  <Search size={14} className="text-emerald-400" />
                  Buscar Coordenadas Automaticamente
                </>
              )}
            </button>
          </div>

          {/* Feedback geocoding */}
          <AnimatePresence>
            {geocodeStatus === 'success' && coordsReady && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
              >
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Coordenadas localizadas</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {parseFloat(formData.lat).toFixed(4)}, {parseFloat(formData.lng).toFixed(4)}
                  </p>
                </div>
              </motion.div>
            )}

            {geocodeStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <AlertTriangle size={16} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Endereço não encontrado</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tente ser mais específico ou preencha as coordenadas manualmente.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lat/Lng manuais */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Coordenadas {coordsReady ? <span className="text-emerald-400">● preenchidas</span> : <span className="text-slate-600">● ou preencha manualmente</span>}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input 
                required
                type="number"
                step="any"
                className={`w-full bg-white/5 border rounded-xl p-4 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${coordsReady ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10'}`}
                placeholder="Latitude"
                value={formData.lat}
                onChange={(e) => setFormData({...formData, lat: e.target.value})}
              />
              <input 
                required
                type="number"
                step="any"
                className={`w-full bg-white/5 border rounded-xl p-4 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${coordsReady ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10'}`}
                placeholder="Longitude"
                value={formData.lng}
                onChange={(e) => setFormData({...formData, lng: e.target.value})}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button 
              disabled={loading || !coordsReady}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando no Sistema...
                </>
              ) : (
                <>
                  Confirmar Registro Territorial
                  <Navigation size={16} />
                </>
              )}
            </button>
            {!coordsReady && (
              <p className="text-center text-[10px] text-slate-600 font-mono mt-2 uppercase tracking-widest">
                Busque as coordenadas para habilitar o cadastro
              </p>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
