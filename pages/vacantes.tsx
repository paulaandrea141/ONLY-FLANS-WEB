import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import Link from 'next/link';

export default function Vacantes() {
  const [vacantes, setVacantes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    empresa: '',
    puesto: '',
    salario: '',
    genero: 'Cualquiera',
    colonia: '',
  });

  useEffect(() => {
    const fetchVacantes = async () => {
      const snap = await db.collection('vacantes').get();
      setVacantes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchVacantes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.collection('vacantes').add({
        ...form,
        salario: parseInt(form.salario),
        estado: 'Activa',
        candidatosAsignados: 0,
        fechaCreacion: new Date(),
        requisitos: { genero: form.genero },
        colonias: [form.colonia],
        horario: { jornadaTipo: 'Matutina' },
      });
      setForm({ empresa: '', puesto: '', salario: '', genero: 'Cualquiera', colonia: '' });
      setShowForm(false);
      const snap = await db.collection('vacantes').get();
      setVacantes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/">
          <p className="text-blue-400 mb-6 cursor-pointer hover:underline">← Volver al Dashboard</p>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Gestionar Vacantes</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded mb-8 transition"
        >
          {showForm ? 'Cancelar' : '+ Nueva Vacante'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded mb-8 space-y-4">
            <input
              type="text"
              placeholder="Empresa"
              value={form.empresa}
              onChange={e => setForm({ ...form, empresa: e.target.value })}
              className="w-full bg-gray-700 p-3 rounded text-white"
              required
            />
            <input
              type="text"
              placeholder="Puesto"
              value={form.puesto}
              onChange={e => setForm({ ...form, puesto: e.target.value })}
              className="w-full bg-gray-700 p-3 rounded text-white"
              required
            />
            <input
              type="number"
              placeholder="Salario"
              value={form.salario}
              onChange={e => setForm({ ...form, salario: e.target.value })}
              className="w-full bg-gray-700 p-3 rounded text-white"
              required
            />
            <input
              type="text"
              placeholder="Colonia"
              value={form.colonia}
              onChange={e => setForm({ ...form, colonia: e.target.value })}
              className="w-full bg-gray-700 p-3 rounded text-white"
              required
            />
            <select
              value={form.genero}
              onChange={e => setForm({ ...form, genero: e.target.value })}
              className="w-full bg-gray-700 p-3 rounded text-white"
            >
              <option>Cualquiera</option>
              <option>M</option>
              <option>F</option>
            </select>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded transition"
            >
              Crear Vacante
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vacantes.map(vacante => (
            <div key={vacante.id} className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-2">{vacante.empresa}</h2>
              <p className="text-gray-400 mb-4">{vacante.puesto}</p>
              <div className="space-y-2 text-sm">
                <p>💰 ${vacante.salario}</p>
                <p>📍 {vacante.colonias?.[0] || 'N/A'}</p>
                <p>👥 Candidatos: {vacante.candidatosAsignados || 0}</p>
                <p className="text-green-400">✓ {vacante.estado}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
