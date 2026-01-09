import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCandidatos } from '../hooks/useCandidatos';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { RadarScan } from '../components/RadarScan';

export default function Candidatos() {
  const router = useRouter();
  const { candidatos, loading } = useCandidatos();
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todos');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('');

  // Leer query param "empresa" de la URL
  useEffect(() => {
    if (router.query.empresa) {
      setFiltroEmpresa(router.query.empresa as string);
    }
  }, [router.query.empresa]);

  const filtrados = candidatos.filter((c) => {
    const matchEtapa = filtroEtapa === 'todos' || c.etapa === filtroEtapa;
    const matchEmpresa = !filtroEmpresa || 
      c.empresa?.toLowerCase().includes(filtroEmpresa.toLowerCase());
    return matchEtapa && matchEmpresa;
  });

  const etapaColors: Record<string, string> = {
    Prospecto: 'bg-blue-500/20 border-blue-500 text-blue-300',
    Calificado: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    Asignado: 'bg-purple-500/20 border-purple-500 text-purple-300',
    Inductado: 'bg-green-500/20 border-green-500 text-green-300',
    Contratado: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
    Rechazado: 'bg-red-500/20 border-red-500 text-red-300',
  };

  const stats = [
    { label: 'Total', value: candidatos.length, icon: '👥' },
    { label: 'Prospectos', value: candidatos.filter((c) => c.etapa === 'Prospecto').length, icon: '🔍' },
    {
      label: 'Contratados',
      value: candidatos.filter((c) => c.etapa === 'Contratado').length,
      icon: '✅',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-purple-500/30 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              👥 CANDIDATOS
            </h1>

            {/* Navigation */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-purple-500/30 text-purple-300 hover:border-purple-400 cursor-pointer transition inline-block">
                📊 Dashboard
              </Link>
              <Link href="/candidatos" className="px-4 py-2 rounded-lg font-mono text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-400 cursor-pointer hover:shadow-lg hover:shadow-purple-500/50 transition inline-block">
                👥 Candidatos
              </Link>
              <Link href="/vacantes" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-purple-500/30 text-purple-300 hover:border-purple-400 cursor-pointer transition inline-block">
                💼 Vacantes
              </Link>
              <Link href="/leads" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-purple-500/30 text-purple-300 hover:border-purple-400 cursor-pointer transition inline-block">
                📞 Leads
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Filtro Empresa Activo */}
          {filtroEmpresa && (
            <div className="mb-4 p-4 rounded-lg bg-yellow-500/20 border border-yellow-500 text-yellow-300 flex items-center justify-between">
              <span className="font-mono">
                🔍 Filtrando por empresa: <strong>{filtroEmpresa}</strong>
              </span>
              <button
                onClick={() => {
                  setFiltroEmpresa('');
                  router.push('/candidatos', undefined, { shallow: true });
                }}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-bold transition"
              >
                ✕ Limpiar
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-xl hover:border-purple-400/50 transition duration-300"
              >
                <p className="text-purple-300 text-sm font-mono">{stat.label}</p>
                <p className="text-4xl font-black text-white mt-2">
                  {stat.icon} {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-8 flex gap-2 flex-wrap">
            {['todos', 'Prospecto', 'Calificado', 'Asignado', 'Inductado', 'Contratado'].map(
              (etapa) => (
                <button
                  key={etapa}
                  onClick={() => setFiltroEtapa(etapa)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition duration-300 ${
                    filtroEtapa === etapa
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-400'
                      : 'bg-black/40 border border-purple-500/30 text-purple-300 hover:border-purple-400'
                  }`}
                >
                  {etapa.charAt(0).toUpperCase() + etapa.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Candidates Grid */}
          <div className="space-y-4">
            {loading ? (
              <LoadingSkeleton />
            ) : filtrados.length === 0 ? (
              <RadarScan />
            ) : (
              filtrados.map((candidato) => (
                <div
                  key={candidato.id}
                  className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-600/10 via-black/50 to-pink-600/10 backdrop-blur-xl hover:border-purple-400/50 transition duration-300"
                >
                  <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition">
                        {candidato.nombre}
                      </h3>
                      <a
                        href={`https://wa.me/${candidato.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 transition font-mono text-sm mt-1"
                      >
                        📱 {candidato.whatsapp}
                      </a>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-purple-300/50 font-mono text-xs">EDAD</p>
                          <p className="text-white font-bold">{candidato.edad} años</p>
                        </div>
                        <div>
                          <p className="text-purple-300/50 font-mono text-xs">COLONIA</p>
                          <p className="text-white font-bold">{candidato.colonia}</p>
                        </div>
                        <div>
                          <p className="text-purple-300/50 font-mono text-xs">FORMACIÓN</p>
                          <p className="text-white font-bold">{candidato.formacion || '-'}</p>
                        </div>
                        <div>
                          <p className="text-purple-300/50 font-mono text-xs">SCORE</p>
                          <p className="text-purple-300 font-bold">
                            {candidato.score || 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-4 py-2 rounded-lg text-sm font-bold border transition duration-300 ${
                          etapaColors[candidato.etapa] ||
                          'bg-gray-500/20 border-gray-500 text-gray-300'
                        }`}
                      >
                        {candidato.etapa}
                      </span>
                      {candidato.vacanteAsignada && (
                        <p className="text-yellow-300 text-sm mt-3 font-mono">
                          💼 {candidato.vacanteAsignada}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );}