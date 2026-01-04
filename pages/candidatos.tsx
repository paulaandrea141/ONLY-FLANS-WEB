import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';

export default function Candidatos() {
  const [candidatos, setCandidatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidatos = async () => {
      const snap = await getDocs(collection(db, 'candidatos'));
      setCandidatos(snap.docs.slice(0, 50).map((doc: any) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    fetchCandidatos();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/">
          <p className="text-blue-400 mb-6 cursor-pointer hover:underline">← Volver al Dashboard</p>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Candidatos</h1>

        {loading ? (
          <p className="text-gray-400">Cargando candidatos...</p>
        ) : candidatos.length > 0 ? (
          <div className="space-y-4">
            {candidatos.map(candidato => (
              <div key={candidato.id} className="bg-gray-800 p-6 rounded-lg flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{candidato.nombre || 'Sin nombre'}</h3>
                  <p className="text-gray-400">{candidato.whatsapp}</p>
                  <p className="text-sm text-gray-500 mt-2">Colonia: {candidato.colonia}</p>
                  <p className="text-sm text-gray-500">Edad: {candidato.edad} años</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded text-sm font-bold ${
                    candidato.etapa === 'Asignado' ? 'bg-green-600' :
                    candidato.etapa === 'Calificado' ? 'bg-blue-600' :
                    candidato.etapa === 'Inductado' ? 'bg-purple-600' :
                    'bg-gray-600'
                  }`}>
                    {candidato.etapa}
                  </span>
                  {candidato.vacanteAsignada && (
                    <p className="text-sm text-yellow-400 mt-2">Score: {candidato.score || 0}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No hay candidatos registrados</p>
        )}
      </div>
    </div>
  );
}
