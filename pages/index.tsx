'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Vacante {
  id: string;
  puesto: string;
  salario: string;
  experiencia: string;
  descripcion: string;
  requisitos: string;
  createdAt?: number;
}

export default function Dashboard() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    puesto: '',
    salario: '',
    experiencia: '',
    descripcion: '',
    requisitos: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchVacantes = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'vacantes'));
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setVacantes(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVacantes();
  }, [mounted]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.puesto || !form.descripcion) {
      alert('⚠️ Puesto y Descripción son obligatorios');
      return;
    }

    try {
      if (editingId) {
        const docRef = doc(db, 'vacantes', editingId);
        await updateDoc(docRef, {
          puesto: form.puesto,
          salario: form.salario,
          experiencia: form.experiencia,
          descripcion: form.descripcion,
          requisitos: form.requisitos,
          updatedAt: Date.now(),
        });
        alert('✅ Vacante actualizada');
      } else {
        await addDoc(collection(db, 'vacantes'), {
          puesto: form.puesto,
          salario: form.salario,
          experiencia: form.experiencia,
          descripcion: form.descripcion,
          requisitos: form.requisitos,
          createdAt: Date.now(),
        });
        alert('✅ Vacante agregada');
      }

      setForm({
        puesto: '',
        salario: '',
        experiencia: '',
        descripcion: '',
        requisitos: '',
      });
      setEditingId(null);

      // Recargar
      const snapshot = await getDocs(collection(db, 'vacantes'));
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setVacantes(data);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al guardar');
    }
  };

  const handleEdit = (vacante: Vacante) => {
    setForm({
      puesto: vacante.puesto,
      salario: vacante.salario,
      experiencia: vacante.experiencia,
      descripcion: vacante.descripcion,
      requisitos: vacante.requisitos,
    });
    setEditingId(vacante.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;

    try {
      await deleteDoc(doc(db, 'vacantes', id));
      setVacantes(vacantes.filter((v) => v.id !== id));
      alert('✅ Eliminada');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error');
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🚀 ONLY FLANS
          </h1>
          <p className="text-gray-300 text-lg">Reclutamiento Autónomo - Monterrey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 p-6 rounded-lg">
            <p className="text-cyan-100 text-sm mb-1">📋 Vacantes</p>
            <p className="text-4xl font-bold">{vacantes.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-lg">
            <p className="text-purple-100 text-sm mb-1">💼 Estado</p>
            <p className="text-2xl font-bold">ACTIVO</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-lg">
            <p className="text-green-100 text-sm mb-1">🤖 IA</p>
            <p className="text-2xl font-bold">ON</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-slate-800 border border-cyan-500 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">
            {editingId ? '✏️ EDITAR VACANTE' : '➕ NUEVA VACANTE'}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Puesto (Operario, Supervisor, etc.)"
                value={form.puesto}
                onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                className="bg-slate-700 border border-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:border-cyan-300"
              />
              <input
                type="text"
                placeholder="Salario ($8000-10000)"
                value={form.salario}
                onChange={(e) => setForm({ ...form, salario: e.target.value })}
                className="bg-slate-700 border border-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:border-cyan-300"
              />
              <input
                type="text"
                placeholder="Experiencia (2-3 años)"
                value={form.experiencia}
                onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
                className="bg-slate-700 border border-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:border-cyan-300"
              />
              <input
                type="text"
                placeholder="Requisitos"
                value={form.requisitos}
                onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                className="bg-slate-700 border border-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:border-cyan-300"
              />
            </div>

            <textarea
              placeholder="Descripción de la vacante (qué hace, responsabilidades, etc.)"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full bg-slate-700 border border-cyan-500 text-white px-4 py-2 rounded focus:outline-none focus:border-cyan-300"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-3 rounded transition"
              >
                {editingId ? '💾 ACTUALIZAR' : '➕ AGREGAR'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      puesto: '',
                      salario: '',
                      experiencia: '',
                      descripcion: '',
                      requisitos: '',
                    });
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition"
                >
                  ❌ CANCELAR
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tabla de Vacantes */}
        <div className="bg-slate-800 border border-purple-500 rounded-lg overflow-hidden">
          <div className="bg-slate-900 border-b border-purple-500 p-6">
            <h3 className="text-xl font-bold">📌 VACANTES ACTIVAS</h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">Cargando...</div>
          ) : vacantes.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Sin vacantes. ¡Agrega una para que la IA comience a reclutar!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr className="border-b border-purple-500">
                    <th className="px-6 py-3 text-left">PUESTO</th>
                    <th className="px-6 py-3 text-left">SALARIO</th>
                    <th className="px-6 py-3 text-left">EXPERIENCIA</th>
                    <th className="px-6 py-3 text-left">DESCRIPCIÓN</th>
                    <th className="px-6 py-3 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {vacantes.map((vacante) => (
                    <tr
                      key={vacante.id}
                      className="border-b border-slate-700 hover:bg-slate-700 transition"
                    >
                      <td className="px-6 py-4 font-semibold">{vacante.puesto}</td>
                      <td className="px-6 py-4 text-cyan-400">{vacante.salario || '-'}</td>
                      <td className="px-6 py-4">{vacante.experiencia || '-'}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-300">
                        {vacante.descripcion}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(vacante)}
                          className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm mr-2 transition"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(vacante.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-slate-800 border border-purple-500 p-6 rounded text-center text-sm text-gray-300">
          <p>💡 Pega las vacantes que tu jefe te pase por WhatsApp. La IA las leerá y comenzará a reclutar automáticamente en los 20 grupos.</p>
        </div>
      </div>
    </div>
  );
}
