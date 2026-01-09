'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Vacante {
  id: string;
  puesto: string;
  salario: string;
  experiencia: string;
  descripcion: string;
  requisitos: string;
  createdAt: number;
}

export default function AdminVacantes() {
  const [vacantes, setVacantes] = useState<Vacante[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    puesto: '',
    salario: '',
    experiencia: '',
    descripcion: '',
    requisitos: '',
  });
  const [mounted, setMounted] = useState(false);

  // Asegurar que el cliente está listo antes de acceder a Firestore
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar vacantes solo cuando el cliente está montado
  useEffect(() => {
    if (!mounted) return;

    const fetchVacantes = async () => {
      try {
        setLoading(true);
        setError(null);
        const querySnapshot = await getDocs(collection(db, 'vacantes'));
        const data: Vacante[] = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...(doc.data() as any),
          });
        });
        setVacantes(data);
      } catch (err: any) {
        console.error('Error cargando vacantes:', err);
        setError(err.message || 'Error al cargar vacantes');
      } finally {
        setLoading(false);
      }
    };

    fetchVacantes();
  }, [mounted]);

  // Guardar/actualizar vacante
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.puesto || !formData.descripcion) {
      alert('Completa al menos Puesto y Descripción');
      return;
    }

    try {
      if (editingId) {
        // Actualizar
        await updateDoc(doc(db, 'vacantes', editingId), {
          ...formData,
          updatedAt: Date.now(),
        });

        setVacantes((prev) => prev.map((v) => (v.id === editingId ? { ...v, ...formData } : v)));

        alert('✅ Vacante actualizada');
      } else {
        // Crear nueva
        const docRef = await addDoc(collection(db, 'vacantes'), {
          ...formData,
          createdAt: Date.now(),
        });

        setVacantes((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...formData,
            createdAt: Date.now(),
          },
        ]);

        alert('✅ Vacante agregada');
      }

      // Limpiar formulario
      setFormData({
        puesto: '',
        salario: '',
        experiencia: '',
        descripcion: '',
        requisitos: '',
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error guardando:', error);
      alert('❌ Error al guardar');
    }
  };

  // Eliminar vacante
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta vacante?')) return;

    try {
      await deleteDoc(doc(db, 'vacantes', id));
      setVacantes((prev) => prev.filter((v) => v.id !== id));
      alert('✅ Vacante eliminada');
    } catch (error) {
      console.error('Error eliminando:', error);
      alert('❌ Error al eliminar');
    }
  };

  // Editar vacante
  const handleEdit = (vacante: Vacante) => {
    setFormData({
      puesto: vacante.puesto,
      salario: vacante.salario,
      experiencia: vacante.experiencia,
      descripcion: vacante.descripcion,
      requisitos: vacante.requisitos,
    });
    setEditingId(vacante.id);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {!mounted ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">📋 Admin de Vacantes</h1>
            <p className="text-gray-600">Agrega, edita o elimina las vacantes disponibles</p>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? '✏️ Editar Vacante' : '➕ Nueva Vacante'}
            </h2>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Puesto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Puesto *</label>
                <input
                  type="text"
                  placeholder="Ej: Operario, Supervisor, Técnico"
                  value={formData.puesto}
                  onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Salario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salario</label>
                <input
                  type="text"
                  placeholder="Ej: $8000-10000"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Experiencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiencia Requerida
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2 años"
                  value={formData.experiencia}
                  onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Requisitos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requisitos</label>
                <input
                  type="text"
                  placeholder="Ej: Licencia, disponibilidad inmediata"
                  value={formData.requisitos}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  placeholder="Describe el puesto, responsabilidades, etc."
                  rows={4}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Botones */}
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {editingId ? '💾 Actualizar' : '➕ Agregar Vacante'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        puesto: '',
                        salario: '',
                        experiencia: '',
                        descripcion: '',
                        requisitos: '',
                      });
                    }}
                    className="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold hover:bg-gray-500 transition"
                  >
                    ❌ Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabla de Vacantes */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                📌 Vacantes Activas ({vacantes.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-600">Cargando vacantes...</div>
            ) : vacantes.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No hay vacantes. ¡Agrega la primera!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Puesto
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Salario
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Experiencia
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacantes.map((vacante) => (
                      <tr
                        key={vacante.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">{vacante.puesto}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{vacante.salario || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{vacante.experiencia || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                          {vacante.descripcion}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(vacante)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => handleDelete(vacante.id)}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
