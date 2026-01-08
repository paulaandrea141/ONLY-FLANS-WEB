import { useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useVacantes } from '../hooks/useVacantes';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { Toast, useToast } from '../components/Toast';
import { validators } from '../lib/validators';

export default function Vacantes() {
  const { vacantes, loading } = useVacantes();
  const { toasts, show, remove } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    empresa: '',
    puesto: '',
    salario: '',
    genero: 'Cualquiera',
    colonia: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.empresa || !form.puesto) {
      show('Empresa y Puesto son obligatorios', 'error');
      return;
    }

    try {
      await addDoc(collection(db, 'vacantes'), {
        empresa: form.empresa.trim(),
        puesto: form.puesto.trim(),
        salario: form.salario ? parseInt(form.salario) : 0,
        estado: 'Activa',
        candidatosAsignados: 0,
        fechaCreacion: new Date(),
        requisitos: { genero: form.genero },
        colonias: form.colonia ? [form.colonia.trim()] : [],
        horario: { jornadaTipo: 'Matutina' },
      });

      show('✅ Vacante creada exitosamente', 'success');
      setForm({
        empresa: '',
        puesto: '',
        salario: '',
        genero: 'Cualquiera',
        colonia: '',
      });
      setShowForm(false);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      show(`Error: ${errorMsg}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-green-500/30 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <h1 className="text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-4">
              💼 GESTIONAR VACANTES
            </h1>

            {/* Navigation */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-green-500/30 text-green-300 hover:border-green-400 cursor-pointer transition inline-block">
                📊 Dashboard
              </Link>
              <Link href="/candidatos" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-green-500/30 text-green-300 hover:border-green-400 cursor-pointer transition inline-block">
                👥 Candidatos
              </Link>
              <Link href="/vacantes" className="px-4 py-2 rounded-lg font-mono text-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-400 cursor-pointer hover:shadow-lg hover:shadow-green-500/50 transition inline-block">
                💼 Vacantes
              </Link>
              <Link href="/leads" className="px-4 py-2 rounded-lg font-mono text-sm glass border border-green-500/30 text-green-300 hover:border-green-400 cursor-pointer transition inline-block">
                📞 Leads
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Create Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className={`mb-8 relative group bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-lg overflow-hidden transition duration-300 hover:shadow-lg hover:shadow-green-500/50 ${
              showForm ? 'ring-2 ring-green-400' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition duration-300" />
            <span className="relative">{showForm ? '✕ CANCELAR' : '➕ NUEVA VACANTE'}</span>
          </button>

          {/* Form Section */}
          {showForm && (
            <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-500/10 via-black/50 to-emerald-500/10 p-8 mb-8 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-transparent to-emerald-600/10 opacity-0 hover:opacity-100 transition duration-500" />

              <h2 className="relative z-10 text-2xl font-black mb-6 text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text">
                ➕ NUEVA VACANTE
              </h2>

              <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Empresa (DAMAR, ILSAN...)"
                    value={form.empresa}
                    onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                    className="bg-black/50 border border-green-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-500/50 backdrop-blur-sm transition"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Puesto (Operario, Supervisor...)"
                    value={form.puesto}
                    onChange={(e) => setForm({ ...form, puesto: e.target.value })}
                    className="bg-black/50 border border-green-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-500/50 backdrop-blur-sm transition"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Salario"
                    value={form.salario}
                    onChange={(e) => setForm({ ...form, salario: e.target.value })}
                    className="bg-black/50 border border-green-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-500/50 backdrop-blur-sm transition"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Colonia"
                    value={form.colonia}
                    onChange={(e) => setForm({ ...form, colonia: e.target.value })}
                    className="bg-black/50 border border-green-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-500/50 backdrop-blur-sm transition"
                    required
                  />
                </div>

                <select
                  value={form.genero}
                  onChange={(e) => setForm({ ...form, genero: e.target.value })}
                  className="w-full bg-black/50 border border-green-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-500/50 backdrop-blur-sm transition"
                >
                  <option>Cualquiera</option>
                  <option>M</option>
                  <option>F</option>
                </select>

                <button
                  type="submit"
                  className="w-full relative group bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-lg overflow-hidden transition duration-300 hover:shadow-lg hover:shadow-green-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition duration-300" />
                  <span className="relative">✅ CREAR VACANTE</span>
                </button>
              </form>
            </div>
          )}

          {/* Vacantes Grid */}
          <div className="space-y-4">
            {loading ? (
              <LoadingSkeleton />
            ) : vacantes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-green-300/50 font-mono">
                  Sin vacantes. Crea una nueva para comenzar.
                </p>
              </div>
            ) : (
              vacantes.map((vacante) => (
                <div
                  key={vacante.id}
                  className="group relative overflow-hidden rounded-xl border border-green-500/20 bg-gradient-to-r from-green-600/10 via-black/50 to-emerald-600/10 backdrop-blur-xl hover:border-green-400/50 transition duration-300 p-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white group-hover:text-green-300 transition">
                          {vacante.empresa}
                        </h2>
                        <span className="px-3 py-1 bg-green-500/20 border border-green-500 text-green-300 rounded-full text-xs font-bold">
                          {vacante.estado || 'Activa'}
                        </span>
                      </div>
                      <p className="text-green-400 font-bold text-lg mb-4">
                        {vacante.puesto}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-green-300/50 font-mono text-xs">SALARIO</p>
                          <p className="text-white font-bold">
                            ${vacante.salario?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-300/50 font-mono text-xs">COLONIA</p>
                          <p className="text-white font-bold">
                            {vacante.colonias?.[0] || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-300/50 font-mono text-xs">CANDIDATOS</p>
                          <p className="text-white font-bold">
                            {vacante.candidatosAsignados || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-300/50 font-mono text-xs">GÉNERO</p>
                          <p className="text-white font-bold">
                            {vacante.requisitos?.genero || 'Cualquiera'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto">
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-300 text-xs font-mono mb-2">📊 ESTADO</p>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-green-300 font-bold">ACTIVA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
