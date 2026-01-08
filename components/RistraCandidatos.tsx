import { useEffect, useState, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import type { Candidato } from '@shared/schema';
import { LoadingCard } from './LoadingSkeleton';

interface RistraProps {
  maxItems?: number;
  filtroEtapa?: string;
}

export const RistraCandidatos = ({ maxItems = 10, filtroEtapa = 'todos' }: RistraProps) => {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'candidatos'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Candidato[] = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() } as Candidato);
        });
        setCandidatos(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching candidatos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [maxItems]);

  const filtrados = useMemo(() => {
    if (filtroEtapa === 'todos') return candidatos;
    return candidatos.filter((c) => c.etapa === filtroEtapa);
  }, [candidatos, filtroEtapa]);

  const etapaColors: Record<string, string> = {
    Prospecto: 'from-blue-500/30 to-blue-600/30 border-blue-500/50 text-blue-300',
    Calificado: 'from-yellow-500/30 to-yellow-600/30 border-yellow-500/50 text-yellow-300',
    Asignado: 'from-purple-500/30 to-purple-600/30 border-purple-500/50 text-purple-300',
    Inductado: 'from-green-500/30 to-green-600/30 border-green-500/50 text-green-300',
    Contratado: 'from-emerald-500/30 to-emerald-600/30 border-emerald-500/50 text-emerald-300',
    Rechazado: 'from-red-500/30 to-red-600/30 border-red-500/50 text-red-300',
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    setScrollPosition(element.scrollLeft);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gradient text-gradient-cyan">
            👥 RISTRA DE CANDIDATOS
          </h2>
          <p className="text-cyan-300/50 font-mono text-sm mt-2">
            {filtrados.length} candidato{filtrados.length !== 1 ? 's' : ''} en tiempo real
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
            {filtrados.length}
          </div>
          <p className="text-cyan-300/50 font-mono text-xs">Total</p>
        </div>
      </div>

      {/* Ristra Horizontal */}
      <div className="relative">
        {/* Scroll indicator left */}
        {scrollPosition > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black to-transparent z-10 flex items-center justify-center">
            <div className="text-cyan-400 font-bold animate-pulse">◀</div>
          </div>
        )}

        {/* Candidates scroll container */}
        <div
          className="overflow-x-auto flex gap-3 pb-2 scroll-smooth"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          {filtrados.length === 0 ? (
            <div className="w-full h-32 glass flex items-center justify-center rounded-xl">
              <p className="text-cyan-300/50 font-mono">
                No hay candidatos con este filtro
              </p>
            </div>
          ) : (
            filtrados.map((candidato, idx) => (
              <div
                key={candidato.id}
                className="flex-shrink-0 w-80 group"
                style={{
                  animation: `slideIn 0.5s ease-out ${idx * 50}ms forwards`,
                  opacity: 0,
                }}
              >
                {/* Card */}
                <div
                  className={`relative h-full glass-neon rounded-xl p-6 border transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden group cursor-pointer`}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 rounded-xl" />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition line-clamp-2">
                          {candidato.nombre}
                        </h3>
                        <p className="text-cyan-300/70 font-mono text-xs mt-1">
                          #{candidato.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>

                      {/* Score Badge */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/50 flex items-center justify-center">
                          <span className="font-black text-cyan-300 text-sm">
                            {candidato.score || 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border bg-gradient-to-r ${
                          etapaColors[candidato.etapa] ||
                          'from-gray-500/30 to-gray-600/30 border-gray-500/50 text-gray-300'
                        }`}
                      >
                        {candidato.etapa}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 text-sm mb-4">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/${candidato.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-green-400 hover:text-green-300 transition font-mono text-xs"
                      >
                        <span>📱</span>
                        <span className="truncate">{candidato.whatsapp}</span>
                      </a>

                      {/* Edad y Colonia */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20">
                        <div>
                          <p className="text-cyan-300/50 font-mono text-xs">EDAD</p>
                          <p className="text-white font-bold">{candidato.edad}a</p>
                        </div>
                        <div>
                          <p className="text-cyan-300/50 font-mono text-xs">COLONIA</p>
                          <p className="text-white font-bold truncate">
                            {candidato.colonia?.slice(0, 10)}
                          </p>
                        </div>
                      </div>

                      {/* Vacante Asignada */}
                      {candidato.vacanteAsignada && (
                        <div className="pt-2 border-t border-cyan-500/20">
                          <p className="text-cyan-300/50 font-mono text-xs">VACANTE</p>
                          <p className="text-purple-300 font-bold truncate">
                            {candidato.vacanteAsignada}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 pt-4 border-t border-cyan-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-300/50 font-mono text-xs">Avance</span>
                        <span className="text-cyan-300 font-mono text-xs font-bold">
                          {candidato.score || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-cyan-500/30">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500 rounded-full"
                          style={{ width: `${candidato.score || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Scroll indicator right */}
        {filtrados.length > 4 && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black to-transparent z-10 flex items-center justify-center pointer-events-none">
            <div className="text-cyan-400 font-bold animate-pulse">▶</div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Prospectos', count: filtrados.filter((c) => c.etapa === 'Prospecto').length, color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30' },
          { label: 'Calificados', count: filtrados.filter((c) => c.etapa === 'Calificado').length, color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' },
          { label: 'Asignados', count: filtrados.filter((c) => c.etapa === 'Asignado').length, color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30' },
          { label: 'Contratados', count: filtrados.filter((c) => c.etapa === 'Contratado').length, color: 'from-green-500/20 to-green-600/20 border-green-500/30' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`glass rounded-lg p-4 text-center border bg-gradient-to-br ${stat.color} transition-all duration-300 hover:scale-105`}
          >
            <p className="text-gray-400 font-mono text-xs mb-2">{stat.label}</p>
            <p className="text-2xl font-black text-cyan-300">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default RistraCandidatos;
