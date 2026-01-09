import { useState } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { addDoc, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';
import { useVacantes } from '../hooks/useVacantes';
import { LoadingSkeleton, LoadingCard } from '../components/LoadingSkeleton';
import { Toast, useToast } from '../components/Toast';
import RistraCandidatos from '../components/RistraCandidatos';
import FireballSwitch from '../components/FireballSwitch';
import VoiceControl from '../components/VoiceControl';
import HistorialChat from '../components/HistorialChat';
import PanelVacantesPendientes from '../components/PanelVacantesPendientes';
import { validators } from '../lib/validators';
import type { Vacante } from '../types';

export default function Dashboard() {
  const { vacantes, loading } = useVacantes();
  const { toasts, show, remove } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [iaEnabled, setIaEnabled] = useState(false);
  const [filtroEtapa, setFiltroEtapa] = useState('todos');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [textoExtraido, setTextoExtraido] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modoIngesta, setModoIngesta] = useState<'texto' | 'imagen' | 'voz'>('texto');
  const [autoPublicar, setAutoPublicar] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(true);
  const [vacantesPendientes, setVacantesPendientes] = useState<any[]>([]);
  const [form, setForm] = useState({
    puesto: '',
    salario: '',
    experiencia: '',
    descripcion: '',
    requisitos: '',
  });

  // 📸 Handler para imágenes
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      show('❌ Solo se permiten imágenes', 'error');
      return;
    }

    setIsProcessingImage(true);
    show('📸 Leyendo captura con Llama Vision...', 'info');

    try {
      // Registrar en historial
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${apiUrl}/api/historial/mensaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: `📸 Captura subida: ${file.name}`,
          tipoInput: 'imagen',
        }),
      });

      const formData = new FormData();
      formData.append('imagen', file);

      const res = await fetch(`${apiUrl}/api/vacantes/extract/image`, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (result.success && result.datosVacante) {
        const d = result.datosVacante;

        // Auto-relleno
        setForm({
          puesto: d.puesto || '',
          salario: d.salario || '',
          experiencia: d.requisitos || '',
          descripcion:
            `📍 ${d.empresa} - ${d.ubicacion}\n⏰ ${d.horario}\n🚌 ${d.rutas_transporte}\n💼 ${d.requisitos}\n💰 ${d.salario}${d.beneficios !== 'No especificado' ? `\n🎁 ${d.beneficios}` : ''}`.trim(),
          requisitos: d.requisitos || '',
        });

        setTextoExtraido(result.textoExtraido);
        show(`✅ Captura leída: ${result.textoExtraido.length} caracteres extraídos`, 'success');

        // Añadir a vacantes pendientes con ID único
        const vacanteTemp = {
          id: Date.now().toString(),
          empresa: d.empresa,
          ubicacion: d.ubicacion,
          datos: d,
        };
        setVacantesPendientes((prev) => [...prev, vacanteTemp]);

        // Registrar respuesta IA en historial
        await fetch(`${apiUrl}/api/historial/mensaje`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contenido: `🧠 Bob: Jessica, detecté ${d.empresa}. ¿La mando a la Ristra?`,
            tipoInput: 'imagen',
          }),
        });
      } else {
        show(`❌ ${result.error || 'No se pudo leer la imagen'}`, 'error');
      }
    } catch (error) {
      console.error('Error procesando imagen:', error);
      show('❌ Error de conexión con el backend', 'error');
    } finally {
      setIsProcessingImage(false);
    }
  };

  // 🎤 Handler para comandos de voz
  const handleVoiceCommand = async (comando: string) => {
    show(`🎤 Procesando: "${comando}"`, 'info');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando, userId: 'jefa' }),
      });

      const result = await res.json();

      if (result.success && result.resultado) {
        const r = result.resultado;

        if (r.tipo === 'cambio' && r.campo) {
          // Aplicar micro-cambio
          setForm((prev) => ({
            ...prev,
            [r.campo]: r.valorNuevo,
          }));
          show(`✅ ${r.confirmacion}`, 'success');
        } else if (r.confirmacion) {
          show(r.confirmacion, 'info');
        }
      }
    } catch (error) {
      console.error('Error procesando voz:', error);
      show('❌ Error procesando comando de voz', 'error');
    }
  };

  // ⌨️ Handler para texto
  const handleIngestaInteligente = async () => {
    const textarea = document.getElementById('ingesta-texto') as HTMLTextAreaElement;
    const texto = textarea?.value.trim();

    if (!texto) {
      show('❌ Pega el texto del Jefecito primero', 'error');
      return;
    }

    setIsProcessing(true);
    show('🔍 Analizando con IA Groq (llama-3.3-70b)...', 'info');

    try {
      const startTime = Date.now();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

      const res = await fetch(`${apiUrl}/api/vacantes/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      });

      const result = await res.json();
      const latency = Date.now() - startTime;

      if (result.success && result.datos) {
        const d = result.datos;

        // ✅ AUTO-RELLENO SANGRIENTO
        setForm({
          puesto: d.puesto || '',
          salario: d.salario || '',
          experiencia: d.requisitos || '',
          descripcion:
            `📍 ${d.empresa} - ${d.ubicacion}\n⏰ ${d.horario}\n🚌 ${d.rutas_transporte}\n💼 ${d.requisitos}\n💰 ${d.salario}${d.beneficios !== 'No especificado' ? `\n🎁 ${d.beneficios}` : ''}`.trim(),
          requisitos: d.requisitos || '',
        });

        show(`✅ Vacante auto-rellenada en ${latency}ms. Revisa y guarda.`, 'success');
        textarea.value = '';

        // Scroll automático al formulario
        document.querySelector('form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-publicar si está activado
        if (autoPublicar) {
          setTimeout(() => {
            const formElement = document.querySelector('form');
            if (formElement) {
              formElement.requestSubmit();
            }
          }, 1500);
        }
      } else {
        show(`❌ ${result.error || 'No se pudo extraer información del texto'}`, 'error');
      }
    } catch (error) {
      console.error('Error en ingesta:', error);
      show('❌ Error de conexión con el backend. Verifica que esté corriendo.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

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
      {/* Panel Vacantes Pendientes */}
      <PanelVacantesPendientes
        vacantes={vacantesPendientes}
        onAceptar={async (id) => {
          const vacante = vacantesPendientes.find((v) => v.id === id);
          if (vacante) {
            // Guardar en Firebase
            const formData = {
              puesto: vacante.datos.puesto || '',
              salario: vacante.datos.salario || '',
              experiencia: vacante.datos.requisitos || '',
              descripcion: vacante.datos.descripcion || '',
              requisitos: vacante.datos.requisitos || '',
            };

            try {
              await addDoc(collection(db, 'vacantes'), formData);
              show(`✅ ${vacante.empresa} guardada en la Ristra`, 'success');

              // Registrar en historial
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
              await fetch(`${apiUrl}/api/historial/mensaje`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contenido: `🧠 Bob: Jessica, ${vacante.empresa} guardada. Ya está en la Ristra.`,
                  tipoInput: 'imagen',
                }),
              });

              setVacantesPendientes((prev) => prev.filter((v) => v.id !== id));
            } catch (error) {
              show('❌ Error al guardar', 'error');
            }
          }
        }}
        onRechazar={async (id) => {
          const vacante = vacantesPendientes.find((v) => v.id === id);
          if (vacante) {
            show(`❌ ${vacante.empresa} descartada`, 'info');

            // Registrar en historial
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            await fetch(`${apiUrl}/api/historial/mensaje`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contenido: `🧠 Bob: Jessica, descartando ${vacante.empresa}. No se guardó nada.`,
                tipoInput: 'imagen',
              }),
            });

            setVacantesPendientes((prev) => prev.filter((v) => v.id !== id));
          }
        }}
      />

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
              <Link
                href="/"
                className="px-4 py-2 rounded-lg font-mono text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/50 transition inline-block"
              >
                📊 Dashboard
              </Link>
              <Link
                href="/candidatos"
                className="px-4 py-2 rounded-lg font-mono text-sm glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer transition inline-block"
              >
                👥 Candidatos
              </Link>
              <Link
                href="/vacantes"
                className="px-4 py-2 rounded-lg font-mono text-sm glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer transition inline-block"
              >
                💼 Vacantes
              </Link>
              <Link
                href="/leads"
                className="px-4 py-2 rounded-lg font-mono text-sm glass border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 cursor-pointer transition inline-block"
              >
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

              {/* 🧠 ZONA DE INGESTA MULTIMODAL 3.0 */}
              <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-2 border-dashed border-orange-500/30 hover:border-orange-400 transition duration-300 relative overflow-hidden">
                {/* Efecto de pulso cuando está procesando */}
                {(isProcessingImage || isProcessing) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-yellow-500/20 to-orange-600/20 animate-pulse" />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🧠</span>
                      <div>
                        <h3 className="text-xl font-black text-orange-400">
                          INGESTA MULTIMODAL 3.0
                        </h3>
                        <p className="text-sm text-orange-300/80 font-mono">
                          📸 Captura + 🎤 Voz + ⌨️ Texto → IA lo procesa TODO
                        </p>
                      </div>
                    </div>

                    {/* Indicador de estado */}
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isProcessingImage || isProcessing
                          ? 'bg-yellow-500/20 text-yellow-400 animate-pulse'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {isProcessingImage || isProcessing ? '⚡ PROCESANDO...' : '✅ LISTO'}
                    </div>
                  </div>

                  {/* TABS: Texto | Imagen | Voz */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => setModoIngesta('texto')}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${
                        modoIngesta === 'texto'
                          ? 'bg-orange-500 text-black'
                          : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                      }`}
                    >
                      ⌨️ TEXTO
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoIngesta('imagen')}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${
                        modoIngesta === 'imagen'
                          ? 'bg-purple-500 text-black'
                          : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                      }`}
                    >
                      📸 CAPTURA
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoIngesta('voz')}
                      className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${
                        modoIngesta === 'voz'
                          ? 'bg-blue-500 text-black'
                          : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                      }`}
                    >
                      🎤 VOZ
                    </button>
                  </div>

                  {/* MODO: IMAGEN */}
                  {modoIngesta === 'imagen' && (
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleImageUpload(file);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-400 transition cursor-pointer bg-black/30"
                    >
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-5xl mb-3">📸</div>
                        <p className="text-purple-400 font-bold mb-2">
                          Arrastra captura del Jefecito o haz click
                        </p>
                        <p className="text-purple-300/60 text-sm">
                          PNG, JPG hasta 5MB • Llama 3.2 Vision lee TODO
                        </p>
                      </label>
                    </div>
                  )}

                  {/* MODO: VOZ */}
                  {modoIngesta === 'voz' && (
                    <div className="p-8 bg-black/30 rounded-lg border border-blue-500/30">
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3">🎤</div>
                        <p className="text-blue-400 font-bold mb-2">Control de Voz Activado</p>
                        <p className="text-blue-300/60 text-sm">
                          Di: "Súbele 2k al sueldo de DAMAR" o "Cambia el horario a vespertino"
                        </p>
                      </div>
                      <VoiceControl onVoiceCommand={handleVoiceCommand} />
                    </div>
                  )}

                  {/* MODO: TEXTO */}
                  {modoIngesta === 'texto' && (
                    <textarea
                      id="ingesta-texto"
                      rows={5}
                      placeholder="Ej: 'urge operario DAMAR turno matutino ruta desde cumbres sueldo 2700 prestaciones completas'"
                      className="w-full bg-black/50 border border-orange-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/50 backdrop-blur-sm transition font-mono text-sm"
                      disabled={isProcessing}
                    />
                  )}

                  {/* Texto extraído (preview) */}
                  {textoExtraido && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <p className="text-green-400 font-mono text-xs mb-2">
                        📝 Texto extraído de la imagen:
                      </p>
                      <p className="text-white text-sm whitespace-pre-wrap">{textoExtraido}</p>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="mt-4 flex gap-3">
                    {modoIngesta === 'texto' && (
                      <button
                        type="button"
                        onClick={handleIngestaInteligente}
                        disabled={isProcessing}
                        className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                          isProcessing
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black hover:from-orange-600 hover:to-yellow-600 hover:scale-105'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <span className="animate-spin inline-block mr-2">⚙️</span>
                            Analizando con Groq IA...
                          </>
                        ) : (
                          <>🚀 ANALIZAR Y AUTO-RELLENAR</>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.getElementById(
                          'ingesta-texto'
                        ) as HTMLTextAreaElement;
                        if (textarea) textarea.value = '';
                        setTextoExtraido('');
                      }}
                      className="px-6 py-3 rounded-lg font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition"
                    >
                      🗑️ LIMPIAR
                    </button>
                  </div>

                  {/* 🔥 BOTÓN DE AUTO-PUBLICACIÓN */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 font-bold text-sm">
                          🚀 PUBLICACIÓN AUTOMÁTICA
                        </p>
                        <p className="text-green-300/60 text-xs font-mono mt-1">
                          La IA analiza, rellena y publica sin confirmación (1.5s delay)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoPublicar(!autoPublicar)}
                        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                          autoPublicar
                            ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.8)]'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {autoPublicar ? '✅ ACTIVADO' : '⭕ DESACTIVADO'}
                      </button>
                    </div>
                  </div>

                  {/* Ejemplos rápidos */}
                  <div className="mt-3 text-xs text-orange-300/60 font-mono">
                    💡 <strong>Ejemplos válidos:</strong> "operario ILSAN 2288 turno vespertino" |
                    "supervisor MAGNEKON experiencia 3 años" | "chofer ruta santa maría sueldo 2500"
                  </div>
                </div>
              </div>

              <div>
                <textarea
                  id="ingesta-texto"
                  placeholder="Ejemplo: 'urge operario en DAMAR sueldo 10k turno matutino ruta desde cumbres req secundaria'"
                  className="w-full bg-black/50 border border-orange-500/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-500/50 backdrop-blur-sm transition font-mono text-sm min-h-[100px]"
                  onPaste={async (e) => {
                    const texto = e.clipboardData.getData('text');
                    if (texto.trim().length > 20) {
                      show('🔍 Analizando texto con IA...', 'info');

                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
                        const res = await fetch(`${apiUrl}/api/vacantes/extract`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ texto }),
                        });

                        const result = await res.json();

                        if (result.success && result.datos) {
                          const d = result.datos;
                          setForm({
                            puesto: d.puesto || '',
                            salario: d.salario || '',
                            experiencia: d.requisitos || '',
                            descripcion: `${d.empresa} - ${d.ubicacion}\n${d.horario}\n${d.rutas_transporte}`,
                            requisitos: d.requisitos || '',
                          });

                          show('✅ Vacante auto-rellenada. Revisa y guarda.', 'success');
                          document.getElementById('ingesta-texto')!.value = '';
                        } else {
                          show(`⚠️ ${result.error || 'No se pudo extraer datos'}`, 'error');
                        }
                      } catch (error) {
                        show('❌ Error al comunicarse con IA', 'error');
                      }
                    }
                  }}
                />
              </div>

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
                    <span className="relative">{editingId ? '💾 ACTUALIZAR' : '➕ AGREGAR'}</span>
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
                      <th className="px-6 py-4 text-left text-sm font-black text-cyan-400">EXP.</th>
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
                        <td className="px-6 py-4 text-gray-400">{vacante.experiencia || '-'}</td>
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
              💡 El bot 🤖 leerá automáticamente estas vacantes y comenzará a reclutar en WhatsApp
            </p>
          </div>
        </main>
      </div>

      {/* Chat Historial Panel */}
      {mostrarHistorial && (
        <div className="fixed right-0 top-0 h-screen w-96 z-50 border-l border-cyan-500/30">
          <HistorialChat />
        </div>
      )}

      {/* Toggle Chat Button */}
      <button
        onClick={() => setMostrarHistorial(!mostrarHistorial)}
        className="fixed right-4 bottom-4 z-[60] bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white font-bold px-4 py-3 rounded-full shadow-2xl border-2 border-yellow-400/50 transition-all hover:scale-110"
      >
        {mostrarHistorial ? '👁️ Ocultar Chat' : '💬 Mostrar Chat'}
      </button>

      {/* Modal de Confirmación */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-fuchsia-900/90 to-purple-900/90 border-4 border-fuchsia-500 rounded-2xl p-8 max-w-md shadow-2xl">
            <h3 className="text-3xl font-black text-fuchsia-300 mb-4">
              ⚠️ CONFIRMAR SUCCIÓN
            </h3>
            <p className="text-white text-lg mb-6">
              ¿Autoriza que la <strong className="text-fuchsia-400">Aspiradora 3000</strong> succione 
              los últimos <strong>300 mensajes</strong> del grupo seleccionado?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmarSuccion}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-black font-black py-4 rounded-xl hover:scale-105 transition"
              >
                ✅ SÍ, SUCCIONAR
              </button>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white font-black py-4 rounded-xl hover:scale-105 transition"
              >
                ❌ CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

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
