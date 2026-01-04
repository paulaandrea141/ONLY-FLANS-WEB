import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Lead {
  id: string;
  nombre: string;
  telefono: string;
  edad: number;
  colonia: string;
  status: 'nuevo' | 'filtrado' | 'citado' | 'no_apto';
  vacanteSugerida?: string;
  papeleríaCompleta: boolean;
  rutaTransporteSabe: boolean;
  lastContact: number;
  notes: string;
  fuenteLead: string;
  fechaCreacion: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [estadísticas, setEstadísticas] = useState({
    total: 0,
    nuevo: 0,
    filtrado: 0,
    citado: 0,
    no_apto: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarLeads();
    const intervalo = setInterval(cargarLeads, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(intervalo);
  }, [filtroStatus]);

  const cargarLeads = async () => {
    try {
      let q;
      if (filtroStatus === 'todos') {
        q = query(collection(db, 'leads'));
      } else {
        q = query(collection(db, 'leads'), where('status', '==', filtroStatus));
      }

      const snapshot = await getDocs(q);
      const leadsData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      } as Lead));

      setLeads(leadsData);

      // Calcular estadísticas
      const allLeads = await getDocs(collection(db, 'leads'));
      const stats = {
        total: allLeads.size,
        nuevo: 0,
        filtrado: 0,
        citado: 0,
        no_apto: 0,
      };

      allLeads.forEach((doc) => {
        const lead = doc.data() as Lead;
        stats[lead.status as keyof typeof stats]++;
      });

      setEstadísticas(stats);
      setCargando(false);
    } catch (error) {
      console.error('Error cargando leads:', error);
      setCargando(false);
    }
  };

  const actualizarStatus = async (leadId: string, nuevoStatus: Lead['status']) => {
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: nuevoStatus,
        fechaActualizacion: Date.now(),
      });
      await cargarLeads();
    } catch (error) {
      console.error('Error actualizando status:', error);
    }
  };

  const getColorStatus = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'bg-blue-100 text-blue-800';
      case 'filtrado':
        return 'bg-yellow-100 text-yellow-800';
      case 'citado':
        return 'bg-green-100 text-green-800';
      case 'no_apto':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">📊 CRM de Leads</h1>
          <p className="text-gray-400">Gestión automatizada de leads en el embudo de reclutamiento</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-blue-600 rounded-lg p-6">
            <div className="text-3xl font-bold text-white">{estadísticas.total}</div>
            <p className="text-blue-100 mt-2">Total Leads</p>
          </div>
          <div className="bg-blue-500 rounded-lg p-6">
            <div className="text-3xl font-bold text-white">{estadísticas.nuevo}</div>
            <p className="text-blue-100 mt-2">Nuevos</p>
          </div>
          <div className="bg-yellow-500 rounded-lg p-6">
            <div className="text-3xl font-bold text-white">{estadísticas.filtrado}</div>
            <p className="text-yellow-100 mt-2">Filtrados</p>
          </div>
          <div className="bg-green-500 rounded-lg p-6">
            <div className="text-3xl font-bold text-white">{estadísticas.citado}</div>
            <p className="text-green-100 mt-2">Citados</p>
          </div>
          <div className="bg-red-500 rounded-lg p-6">
            <div className="text-3xl font-bold text-white">{estadísticas.no_apto}</div>
            <p className="text-red-100 mt-2">No Aptos</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['todos', 'nuevo', 'filtrado', 'citado', 'no_apto'].map((status) => (
            <button
              key={status}
              onClick={() => setFiltroStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtroStatus === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Tabla de Leads */}
        {cargando ? (
          <div className="text-center text-gray-400">Cargando...</div>
        ) : (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Teléfono</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Colonia</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Último Contacto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No hay leads con este filtro
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-slate-700 hover:bg-slate-700">
                      <td className="px-6 py-4 text-white font-medium">{lead.nombre}</td>
                      <td className="px-6 py-4 text-gray-300">
                        <a
                          href={`https://wa.me/${lead.telefono}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:underline"
                        >
                          {lead.telefono}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{lead.colonia}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorStatus(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatearFecha(lead.lastContact)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => actualizarStatus(lead.id, e.target.value as Lead['status'])}
                          className="bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        >
                          <option value="nuevo">Nuevo</option>
                          <option value="filtrado">Filtrado</option>
                          <option value="citado">Citado</option>
                          <option value="no_apto">No Apto</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
