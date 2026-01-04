import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import Link from 'next/link';

export default function Dashboard() {
  const [vacantes, setVacantes] = useState<any[]>([]);
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const vacantesSnap = await db.collection('vacantes').get();
        const candidatosSnap = await db.collection('candidatos').limit(10).get();
        
        setVacantes(vacantesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCandidatos(candidatosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Only Flans</h1>
          <p className="text-gray-400">Plataforma de Reclutamiento Autónoma - Monterrey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-2">Vacantes Activas</h3>
            <p className="text-3xl font-bold">{vacantes.filter(v => v.estado === 'Activa').length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-2">Candidatos</h3>
            <p className="text-3xl font-bold">{candidatos.length}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm mb-2">Asignados</h3>
            <p className="text-3xl font-bold">{candidatos.filter(c => c.etapa === 'Asignado').length}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/vacantes">
            <div className="bg-blue-600 hover:bg-blue-700 p-8 rounded-lg cursor-pointer transition">
              <h2 className="text-2xl font-bold mb-2">Gestionar Vacantes</h2>
              <p className="text-gray-100">Crear, editar y eliminar vacantes</p>
            </div>
          </Link>
          <Link href="/candidatos">
            <div className="bg-purple-600 hover:bg-purple-700 p-8 rounded-lg cursor-pointer transition">
              <h2 className="text-2xl font-bold mb-2">Ver Candidatos</h2>
              <p className="text-gray-100">Historial y seguimiento de candidatos</p>
            </div>
          </Link>
        </div>

        {/* Últimas Vacantes */}
        <div className="bg-gray-800 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold mb-6">Últimas Vacantes</h2>
          {loading ? (
            <p className="text-gray-400">Cargando...</p>
          ) : vacantes.length > 0 ? (
            <div className="space-y-4">
              {vacantes.slice(0, 5).map(vacante => (
                <div key={vacante.id} className="border border-gray-700 p-4 rounded">
                  <h3 className="font-bold">{vacante.empresa}</h3>
                  <p className="text-gray-400">{vacante.puesto}</p>
                  <p className="text-sm text-gray-500">Candidatos asignados: {vacante.candidatosAsignados || 0}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No hay vacantes</p>
          )}
        </div>
      </div>
    </div>
  );
}
