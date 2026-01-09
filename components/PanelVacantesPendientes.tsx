import { useState } from 'react';

interface VacantePendiente {
  id: string;
  empresa: string;
  ubicacion: string;
  datos: any;
}

interface Props {
  vacantes: VacantePendiente[];
  onAceptar: (id: string) => void;
  onRechazar: (id: string) => void;
}

export default function PanelVacantesPendientes({ vacantes, onAceptar, onRechazar }: Props) {
  if (vacantes.length === 0) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500 bg-gradient-to-br from-black via-orange-950/50 to-black backdrop-blur-xl shadow-2xl shadow-orange-500/20">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-yellow-600/10 to-orange-600/10 animate-pulse" />
        
        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              👑 JESSICA, CONFIRMA ESTAS VACANTES
            </h3>
            <div className="px-3 py-1 bg-orange-600 rounded-full text-white font-bold text-sm">
              {vacantes.length}
            </div>
          </div>

          {/* Lista de vacantes */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {vacantes.map((vacante) => (
              <div
                key={vacante.id}
                className="group relative overflow-hidden rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 p-4 hover:border-orange-400 transition duration-300"
              >
                <div className="flex items-start justify-between">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏢</span>
                      <h4 className="text-xl font-bold text-white">
                        {vacante.empresa}
                      </h4>
                    </div>
                    <p className="text-cyan-300 font-mono text-sm mb-1">
                      📍 {vacante.ubicacion}
                    </p>
                    {vacante.datos.puesto && (
                      <p className="text-purple-300 font-mono text-sm">
                        💼 {vacante.datos.puesto}
                      </p>
                    )}
                    {vacante.datos.salario && (
                      <p className="text-green-300 font-mono text-sm">
                        💰 {vacante.datos.salario}
                      </p>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => onAceptar(vacante.id)}
                      className="group/btn relative px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-sm border-2 border-green-400/50 hover:border-green-300 transition-all hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
                    >
                      <span className="relative z-10">✅ ACEPTAR</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 opacity-0 group-hover/btn:opacity-100 transition rounded-lg" />
                    </button>
                    
                    <button
                      onClick={() => onRechazar(vacante.id)}
                      className="group/btn relative px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm border-2 border-red-400/50 hover:border-red-300 transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
                    >
                      <span className="relative z-10">❌ RECHAZAR</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 opacity-0 group-hover/btn:opacity-100 transition rounded-lg" />
                    </button>
                  </div>
                </div>

                {/* Glowing border on hover */}
                <div className="absolute inset-0 border-2 border-orange-400/0 group-hover:border-orange-400/50 rounded-xl transition duration-300 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-orange-500/30">
            <p className="text-orange-300 text-sm font-mono text-center">
              💡 Bob detectó estas empresas. Acepta para publicar o rechaza para descartar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
