import { useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { addDoc, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';
import { useVacantes } from '../hooks/useVacantes';
import { LoadingSkeleton, LoadingCard } from '../components/LoadingSkeleton';
import { Toast, useToast } from '../components/Toast';
import RistraCandidatos from '../components/RistraCandidatos';
import FireballSwitch from '../components/FireballSwitch';
import { validators } from '../lib/validators';
import type { Vacante } from '../types';

export default function Dashboard() {
  const { vacantes, loading } = useVacantes();
  const { toasts, show, remove } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [iaEnabled, setIaEnabled] = useState(false);
  const [filtroEtapa, setFiltroEtapa] = useState('todos');
  const [form, setForm] = useState({
    puesto: '',
    salario: '',
    experiencia: '',
    descripcion: '',
    requisitos: '',
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validators.validateVacante(form);
    if (!validation.valid) {
      validation.errors.forEach((err) => show(err, 'error'));
      return;
    }

    try {
      if (editingId) {
        const docRef = doc(db, 'vacantes', editingId);
        await updateDoc(docRef, {
          puesto: form.puesto.trim(),
          salario: form.salario.trim(),
          experiencia: form.experiencia.trim(),
          descripcion: form.descripcion.trim(),
          requisitos: form.requisitos.trim(),
          updatedAt: Date.now(),
        });
        show('✅ Vacante actualizada', 'success');
      } else {
        await addDoc(collection(db, 'vacantes'), {
          puesto: form.puesto.trim(),
          salario: form.salario.trim(),
          experiencia: form.experiencia.trim(),
          descripcion: form.descripcion.trim(),
          requisitos: form.requisitos.trim(),
          createdAt: Date.now(),
        });
        show('✅ Vacante agregada', 'success');
      }

      setForm({
        puesto: '',
        salario: '',
        experiencia: '',
        descripcion: '',
        requisitos: '',
      });
      setEditingId(null);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      show(`Error: ${errorMsg}`, 'error');
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
    if (!confirm('¿Eliminar esta vacante? Esta acción no se puede deshacer.')) return;

    try {
      await deleteDoc(doc(db, 'vacantes', id));
      show('✅ Vacante eliminada', 'success');
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      show(`Error al eliminar: ${errorMsg}`, 'error');
    }
  };

  const stats = [
    { label: '📋 Vacantes Activas', value: vacantes.length, color: 'from-cyan-500 to-blue-600' },
    {
      label: '🤖 Bot WhatsApp',
      value: 'ACTIVO',
      color: 'from-purple-500 to-pink-600',
    },
    {
      label: '💾 Base de Datos',
      value: 'FIREBASE',
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-cyan-500/30 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ◆ ONLY FLANS ◆
                </h1>
                <p className="text-cyan-300 text-sm font-mono mt-1">
                  Reclutamiento Autónomo 2045 | Monterrey
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-300 font-mono text-sm">BOT ONLINE</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/" className="px-4 py-2 rounded-lg font-mono text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50 transition inline-block">
                📊 Dashboard
              </Link>
              <Link href="/candidatos" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer transition inline-block">
                👥 Candidatos
              </Link>
              <Link href="/vacantes" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer transition inline-block">
                💼 Vacantes
              </Link>
              <Link href="/leads" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer transition inline-block">
                📞 Leads
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Fireball Switch - Control IA */}
          <div className="mb-8 glass-heavy rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-transparent bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text">
                  🔥 CONTROL DE IA - GROQ
                </h2>
                <p className="text-orange-300/50 font-mono text-sm mt-1">
                  Activa el bot para análisis automático de candidatos
                </p>
              </div>
              <FireballSwitch
                onToggle={(state) => {
                  setIaEnabled(state);
                  show(
                    state ? '🔥 IA ACTIVADA - Analizando candidatos' : '❄️ IA desactivada',
                    state ? 'success' : 'info'
                  );
                }}
                initialState={iaEnabled}
              />
            </div>
          </div>

          {/* Ristra de Candidatos */}
          <div className="mb-8">
            <div className="mb-4 flex gap-2 flex-wrap">
              {['todos', 'Prospecto', 'Calificado', 'Asignado', 'Inductado', 'Contratado'].map(
                (etapa) => (
                  <button
                    key={etapa}
                    onClick={() => setFiltroEtapa(etapa)}
                    className={`px-4 py-2 rounded-lg font-mono text-sm transition duration-300 ${
                      filtroEtapa === etapa
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400'
                        : 'glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400'
                    }`}
                  >
                    {etapa.charAt(0).toUpperCase() + etapa.slice(1)}
                  </button>
                )
              )}
            </div>
            <RistraCandidatos maxItems={15} filtroEtapa={filtroEtapa} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br ${stat.color} p-0.5`}
              >
                <div className="relative bg-black/80 backdrop-blur-xl rounded-lg p-6 h-32 flex flex-col justify-center hover:bg-black/60 transition duration-300">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-cyan-400 to-purple-400 transition duration-300" />
                  <p className="text-cyan-300 text-sm font-mono relative">{stat.label}</p>
                  <p className="text-3xl font-black text-white relative mt-2">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form Section */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-black/50 to-cyan-500/10 p-8 mb-8 backdrop-blur-xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-cyan-600/10 opacity-0 hover:opacity-100 transition duration-500" />

            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-6 text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                {editingId ? '⚡ EDITAR VACANTE' : '➕ NUEVA VACANTE'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Puesto (Operario, Supervisor...)"
                    value={form.puesto}
                    onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                    className="bg-black/50 border border-cyan-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-sm transition"
                  />
                  <input
                    type="text"
                    placeholder="Salario ($8000-10000)"
                    value={form.salario}
                    onChange={(e) => setForm({ ...form, salario: e.target.value })}
                    className="bg-black/50 border border-cyan-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-sm transition"
                  />
                  <input
                    type="text"
                    placeholder="Experiencia (2-3 años)"
                    value={form.experiencia}
                    onChange={(e) => setForm({ ...form, experiencia: e.target.value })}
                    className="bg-black/50 border border-cyan-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-sm transition"
                  />
                  <input
                    type="text"
                    placeholder="Requisitos"
                    value={form.requisitos}
                    onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
                    className="bg-black/50 border border-cyan-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-sm transition"
                  />
                </div>

                <textarea
                  placeholder="Descripción de la vacante (qué hace, responsabilidades...)"
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full bg-black/50 border border-cyan-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-sm transition"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 relative group bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg overflow-hidden transition duration-300 hover:shadow-lg hover:shadow-cyan-500/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition duration-300" />
                    <span className="relative">
                      {editingId ? '💾 ACTUALIZAR' : '➕ AGREGAR'}
                    </span>
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
                      className="flex-1 bg-red-600/20 border border-red-500/50 hover:border-red-500 text-red-300 font-bold py-3 rounded-lg transition duration-300"
                    >
                      ❌ CANCELAR
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Vacantes Table */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-black/40 backdrop-blur-xl">
            <div className="border-b border-purple-500/30 p-6 bg-gradient-to-r from-purple-600/20 to-cyan-600/20">
              <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
                📌 VACANTES ACTIVAS
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8">
                  <LoadingSkeleton />
                </div>
              ) : vacantes.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-cyan-300/50 font-mono">
                    Sin vacantes. Pega las que tu jefe te envíe por WhatsApp 📱
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="border-b border-purple-500/20 bg-black/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-black text-cyan-400">
                        PUESTO
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cyan-400">
                        SALARIO
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cyan-400">
                        EXP.
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-black text-cyan-400">
                        DESCRIPCIÓN
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-black text-cyan-400">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vacantes.map((vacante) => (
                      <tr
                        key={vacante.id}
                        className="border-b border-purple-500/10 hover:bg-cyan-500/10 transition duration-200 group"
                      >
                        <td className="px-6 py-4 font-bold text-white group-hover:text-cyan-400 transition">
                          {vacante.puesto}
                        </td>
                        <td className="px-6 py-4 text-cyan-300 font-mono">
                          ${vacante.salario || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {vacante.experiencia || '-'}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-gray-300">
                          {vacante.descripcion}
                        </td>
                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => handleEdit(vacante)}
                            className="bg-blue-600/30 border border-blue-500/50 hover:border-blue-400 hover:bg-blue-600/50 text-blue-300 px-3 py-1 rounded text-sm transition"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(vacante.id)}
                            className="bg-red-600/30 border border-red-500/50 hover:border-red-400 hover:bg-red-600/50 text-red-300 px-3 py-1 rounded text-sm transition"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 relative group overflow-hidden rounded-xl border border-cyan-500/30 p-6 bg-gradient-to-r from-cyan-500/10 via-black/50 to-purple-500/10 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition duration-500" />
            <p className="relative text-cyan-300 font-mono text-sm text-center">
              💡 El bot 🤖 leerá automáticamente estas vacantes y comenzará a reclutar en
              WhatsApp
            </p>
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
