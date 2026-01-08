import { useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useLeads } from '../hooks/useLeads';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Toast, useToast } from '../components/Toast';
import type { Lead } from '../types';

export default function LeadsPage() {
  const { leads, loading } = useLeads();
  const { toasts, show, remove } = useToast();
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const filtrados =
    filtroStatus === 'todos'
      ? leads
      : leads.filter((l) => l.status === filtroStatus);

  const stats = [
    { label: 'Total Leads', value: leads.length, color: 'from-blue-500 to-blue-600', icon: '📊' },
    {
      label: 'Nuevos',
      value: leads.filter((l) => l.status === 'nuevo').length,
      color: 'from-cyan-500 to-cyan-600',
      icon: '🆕',
    },
    {
      label: 'Filtrados',
      value: leads.filter((l) => l.status === 'filtrado').length,
      color: 'from-yellow-500 to-yellow-600',
      icon: '📋',
    },
    {
      label: 'Citados',
      value: leads.filter((l) => l.status === 'citado').length,
      color: 'from-green-500 to-green-600',
      icon: '✅',
    },
    {
      label: 'No Aptos',
      value: leads.filter((l) => l.status === 'no_apto').length,
      color: 'from-red-500 to-red-600',
      icon: '❌',
    },
  ];

  const statusColors: Record<string, string> = {
    nuevo: 'bg-blue-500/20 border-blue-500 text-blue-300',
    filtrado: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    citado: 'bg-green-500/20 border-green-500 text-green-300',
    no_apto: 'bg-red-500/20 border-red-500 text-red-300',
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        fechaActualizacion: Date.now(),
      });
      show('✅ Estado actualizado', 'success');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      show(`Error: ${errorMsg}`, 'error');
    }
  };

  const formatearFecha = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-blue-500/30 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">
              📊 CRM DE LEADS
            </h1>
            <p className="text-blue-300/50 font-mono text-sm mb-4">
              Gestión automatizada del embudo de reclutamiento
            </p>

            {/* Navigation */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-blue-500/30 text-blue-300 hover:border-blue-400 cursor-pointer transition inline-block">
                📊 Dashboard
              </Link>
              <Link href="/candidatos" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-blue-500/30 text-blue-300 hover:border-blue-400 cursor-pointer transition inline-block">
                👥 Candidatos
              </Link>
              <Link href="/vacantes" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-blue-500/30 text-blue-300 hover:border-blue-400 cursor-pointer transition inline-block">
                💼 Vacantes
              </Link>
              <Link href="/leads" className="px-4 py-2 rounded-lg font-mono text-sm bg-gradient-to-r from-blue-600 to-green-600 text-white border border-blue-400 cursor-pointer hover:shadow-lg hover:shadow-blue-500/50 transition inline-block">
                📞 Leads
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-br ${stat.color} p-0.5 group`}
              >
                <div className="relative bg-black/80 backdrop-blur-xl rounded-lg p-6 h-32 flex flex-col justify-center hover:bg-black/60 transition duration-300">
                  <p className="text-blue-300 text-sm font-mono">{stat.icon} {stat.label}</p>
                  <p className="text-3xl font-black text-white mt-2">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-8 flex gap-2 flex-wrap">
            {['todos', 'nuevo', 'filtrado', 'citado', 'no_apto'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition duration-300 ${
                  filtroStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white border border-blue-400'
                    : 'bg-black/40 border border-blue-500/30 text-blue-300 hover:border-blue-400'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Leads Table */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-black/40 backdrop-blur-xl">
            <div className="border-b border-blue-500/30 p-6 bg-gradient-to-r from-blue-600/20 to-green-600/20">
              <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text">
                📋 {filtroStatus === 'todos' ? 'TODOS LOS LEADS' : filtroStatus.toUpperCase()}
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8">
                  <LoadingSkeleton />
                </div>
              ) : filtrados.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-blue-300/50 font-mono">
                    No hay leads con este filtro
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-blue-500/20 bg-black/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-blue-400">
                        NOMBRE
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-blue-400">
                        TELÉFONO
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-blue-400">
                        COLONIA
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-blue-400">
                        STATUS
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-blue-400">
                        ÚLTIMO CONTACTO
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-black text-blue-400">
                        ACCIÓN
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-blue-500/10 hover:bg-blue-500/10 transition duration-200 group"
                      >
                        <td className="px-6 py-4 font-bold text-white group-hover:text-blue-400 transition">
                          {lead.nombre}
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`https://wa.me/${lead.telefono}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 transition font-mono text-sm"
                          >
                            📱 {lead.telefono}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-blue-300">{lead.colonia}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold border transition duration-300 ${
                              statusColors[lead.status] ||
                              'bg-gray-500/20 border-gray-500 text-gray-300'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm font-mono">
                          {formatearFecha(lead.lastContact)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(lead.id, e.target.value as Lead['status'])
                            }
                            className="bg-black/60 border border-blue-500/50 text-white px-3 py-2 rounded text-sm font-mono focus:outline-none focus:border-blue-400 transition"
                          >
                            <option value="nuevo">Nuevo</option>
                            <option value="filtrado">Filtrado</option>
                            <option value="citado">Citado</option>
                            <option value="no_apto">No Apto</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => remove(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

