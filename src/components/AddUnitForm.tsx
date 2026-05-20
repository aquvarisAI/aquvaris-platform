import React, { useState } from 'react';
import { X, Building2, Navigation, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { EnvironmentalRisk } from '../types';

interface AddUnitFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddUnitForm({ onClose, onSuccess }: AddUnitFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
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
      console.error("Error adding unit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#080C14]/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0F172A] w-full max-w-lg border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase">Nova Unidade</h2>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none mt-1">Mapeamento Territorial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Identificação Operacional</label>
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

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Localização Global</label>
              <div className="relative group">
                <textarea 
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-sm outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium h-24 resize-none"
                  placeholder="Brasília, DF - Setor Comercial, 1200"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
                <MapPin className="absolute left-4 top-5 text-gray-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Latitude</label>
                  <input 
                    required
                    type="number"
                    step="any"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="-15.7942"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Longitude</label>
                  <input 
                    required
                    type="number"
                    step="any"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="-47.8822"
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  />
               </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? 'Inicializando Malha...' : 'Confirmar Registro Territorial'}
              <Navigation size={18} />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
