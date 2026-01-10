import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { addDoc, deleteDoc, doc, updateDoc, collection } from 'firebase/firestore';
import { useVacantes } from '../hooks/useVacantes';
import { LoadingSkeleton, LoadingCard } from '../components/LoadingSkeleton';
import { Toast, useToast } from '../components/Toast';
import RistraCandidatos from '../components/RistraCandidatos';
import FireballSwitch from '../components/FireballSwitch';
import PanelVacantesPendientes from '../components/PanelVacantesPendientes';
// import AspiradoraRealTime from '../components/AspiradoraRealTime'; // No existe en rama-2
import { validators } from '../lib/validators';
import type { Vacante } from '../types';

export default function Dashboard() {
  const { vacantes, loading } = useVacantes();
  const { toasts, show, remove } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtroEtapa, setFiltroEtapa] = useState('todos');
  const [vacantesPendientes, setVacantesPendientes] = useState<any[]>([]);

  // 🔥 ASPIRADORA 3000: Estados
  const [grupos, setGrupos] = useState<
    Array<{ id: string; nombre: string; participantes: number }>
  >([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [succionando, setSuccionando] = useState(false);
  const [mensajesProcesados, setMensajesProcesados] = useState(0);
  const [resultadoSuccion, setResultadoSuccion] = useState<any>(null);
  const [publicando, setPublicando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [iaEnabled, setIaEnabled] = useState(true); // Estado de IA

  const [form, setForm] = useState({
    puesto: '',
    salario: '',
    experiencia: '',
    descripcion: '',
    requisitos: '',
  });

  // 🔥 ASPIRADORA 3000: Cargar grupos disponibles
  useEffect(() => {
    const cargarGrupos = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/api/grupos/listar`);
        const data = await res.json();
        if (data.success) setGrupos(data.grupos);
      } catch (error) {
        console.error('Error cargando grupos:', error);
      }
    };
    cargarGrupos();
  }, []);

  //  ASPIRADORA 3000: Handler Succionar Grupo
  const handleSuccionarGrupo = async () => {
    if (!grupoSeleccionado) {
      show('❌ Selecciona el grupo de jefecito primero', 'error');
      return;
    }
    // 🔥 Mostrar modal de confirmación
    setMostrarConfirmacion(true);
  };

  const confirmarSuccion = async () => {
    setMostrarConfirmacion(false);
    setSuccionando(true);
    setMensajesProcesados(0);
    setResultadoSuccion(null);
    show('🌪️ Iniciando succión... 30-60 segundos', 'info');

    try {
      // Simular progreso
      const interval = setInterval(() => {
        setMensajesProcesados((prev) => {
          if (prev >= 300) {
            clearInterval(interval);
            return 300;
          }
          return prev + 15;
        });
      }, 500);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/grupos/succionar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoId: grupoSeleccionado }),
      });

      clearInterval(interval);
      const data = await res.json();

      if (data.success) {
        setResultadoSuccion(data.data);
        setMensajesProcesados(300);
        show(`✅ Succión completa: ${data.data.vacantesDetectadas} vacantes detectadas`, 'success');

        // Registrar en historial
        await fetch(`${apiUrl}/api/historial/mensaje`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contenido: `🔥 ASPIRADORA 3000: Succionó ${data.data.totalMensajes} mensajes, detectó ${data.data.vacantesDetectadas} vacantes (${data.data.nuevas} nuevas, ${data.data.actualizadas} actualizadas)`,
            tipoInput: 'sistema',
          }),
        });
      } else {
        show(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      show('❌ Error de conexión', 'error');
    } finally {
      setSuccionando(false);
    }
  };

  // 🔥 ASPIRADORA 3000: Handler Publicar Facebook
  const handlePublicarFacebook = async () => {
    setPublicando(true);
    show('📤 Publicando en Facebook...', 'info');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/facebook/publicar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        show(`✅ Publicadas ${data.publicadas} vacantes en Facebook`, 'success');
      } else {
        show(`❌ ${data.error}`, 'error');
      }
    } catch (error) {
      show('❌ Error publicando', 'error');
    } finally {
      setPublicando(false);
    }
  };

  const handleEdit = (vacante: Vacante) => {
    setForm({
      puesto: vacante.puesto,
      salario: String(vacante.salario),
      experiencia: vacante.requisitos?.experiencia || '',
      descripcion: '', // Vacante no tiene descripcion
      requisitos: vacante.requisitos?.restricciones?.join(', ') || '',
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
    <div className="min-h-screen bg-black text-white overflow-hidden flex">
      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1">
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

            {/* 🌪️ ASPIRADORA 3000 - TAMAÑO COMPLETO GIGANTE */}
            <div
              id="terminal-aspiradora"
              style={{
                backgroundColor: '#000000',
                color: '#00FF41',
                padding: '48px',
                marginBottom: '32px',
                borderRadius: '24px',
                border: '4px solid #ff00ff',
                fontFamily: '"Cascadia Code", "Fira Code", monospace',
                boxShadow: 'inset 0 0 20px #000000, 0 0 15px #ff00ff',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="relative z-10">
                {/* Header GIGANTE con icono giratorio */}
                <div className="flex items-center gap-6 mb-8 border-b-2 border-fuchsia-500 pb-6">
                  <div className={`text-8xl ${succionando ? 'animate-spin' : ''}`}>🌪️</div>
                  <div className="flex-1">
                    <h2 className="text-6xl font-black text-white mb-2">
                      ASPIRADORA 3000 - SISTEMA TOTAL
                    </h2>
                    <p style={{ color: '#ff00ff', fontWeight: 'bold', fontSize: '20px' }}>
                      [CORP. TYRELL - RAMA 8 - TERMINAL DE CONTROL]
                    </p>
                  </div>
                  {/* Badge de status GIGANTE */}
                  <div
                    style={{
                      padding: '24px 32px',
                      borderRadius: '16px',
                      fontWeight: 900,
                      fontSize: '24px',
                      border: '4px solid',
                      backgroundColor: succionando
                        ? 'rgba(234, 179, 8, 0.2)'
                        : resultadoSuccion
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(255, 0, 255, 0.2)',
                      color: succionando ? '#facc15' : resultadoSuccion ? '#4ade80' : '#ff00ff',
                      borderColor: succionando
                        ? '#eab308'
                        : resultadoSuccion
                          ? '#22c55e'
                          : '#ff00ff',
                    }}
                  >
                    {succionando ? '⚙️ ACTIVA' : resultadoSuccion ? '✅ COMPLETA' : '🔥 LISTA'}
                  </div>
                </div>

                {/* Selector de Grupo GRANDE */}
                <div className="mb-8">
                  <label className="block text-fuchsia-300 font-black text-2xl mb-4">
                    📱 GRUPO DE WHATSAPP:
                  </label>
                  <select
                    value={grupoSeleccionado}
                    onChange={(e) => setGrupoSeleccionado(e.target.value)}
                    className="w-full bg-black/60 border-4 border-fuchsia-500/50 text-white px-8 py-6 rounded-2xl text-2xl font-bold focus:border-fuchsia-400 focus:ring-4 focus:ring-fuchsia-400"
                    disabled={succionando}
                  >
                    <option value="">-- Selecciona grupo jefecito --</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nombre} ({g.participantes} miembros)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón de Succión GIGANTE */}
                <button
                  onClick={handleSuccionarGrupo}
                  disabled={succionando || !grupoSeleccionado}
                  className={`w-full px-12 py-8 rounded-3xl font-black text-4xl mb-8 transition-all duration-300 shadow-2xl ${
                    succionando || !grupoSeleccionado
                      ? 'bg-gray-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 text-black hover:scale-105 hover:shadow-fuchsia-500/60 active:scale-95'
                  }`}
                >
                  {succionando ? '🌀 SUCCIONANDO DATOS...' : '🔥 SUCCIONAR GRUPO COMPLETO'}
                </button>

                {/* Barra de Progreso GRANDE */}
                {succionando && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold font-mono" style={{ color: '#00FF41' }}>
                        Procesando {mensajesProcesados}/300 mensajes...
                      </span>
                      <span className="text-4xl font-black font-mono" style={{ color: '#ff00ff' }}>
                        {Math.round((mensajesProcesados / 300) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-8 bg-black rounded-full overflow-hidden border-4 border-fuchsia-500">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-pink-500 transition-all duration-500 animate-pulse shadow-lg shadow-fuchsia-500/50"
                        style={{ width: `${(mensajesProcesados / 300) * 100}%` }}
                      />
                    </div>
                    <p
                      className="text-lg mt-4 font-mono animate-pulse"
                      style={{ color: '#00FF41' }}
                    >
                      🧠 Groq IA (Llama 3.3 70B) analizando contexto completo...
                    </p>
                  </div>
                )}

                {/* Resultado de Succión GRANDE */}
                {resultadoSuccion && (
                  <div
                    style={{
                      padding: '32px',
                      backgroundColor: '#000000',
                      border: '4px solid #22c55e',
                      borderRadius: '16px',
                      marginBottom: '32px',
                      boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)',
                    }}
                  >
                    <h4
                      style={{
                        color: '#4ade80',
                        fontWeight: 900,
                        fontSize: '30px',
                        marginBottom: '24px',
                      }}
                    >
                      ✅ SUCCIÓN COMPLETADA
                    </h4>
                    <div className="grid grid-cols-3 gap-6 text-center mb-6">
                      <div
                        style={{
                          backgroundColor: '#1a1a1a',
                          padding: '24px',
                          borderRadius: '12px',
                          border: '2px solid rgba(34, 197, 94, 0.3)',
                        }}
                      >
                        <p
                          style={{ fontSize: '48px', fontWeight: 900, color: '#4ade80', margin: 0 }}
                        >
                          {resultadoSuccion.totalMensajes}
                        </p>
                        <p
                          style={{
                            fontSize: '18px',
                            color: 'rgba(74, 222, 128, 0.8)',
                            marginTop: '8px',
                          }}
                        >
                          Mensajes
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#1a1a1a',
                          padding: '24px',
                          borderRadius: '12px',
                          border: '2px solid rgba(255, 0, 255, 0.3)',
                        }}
                      >
                        <p
                          style={{ fontSize: '48px', fontWeight: 900, color: '#ff00ff', margin: 0 }}
                        >
                          {resultadoSuccion.vacantesDetectadas}
                        </p>
                        <p
                          style={{
                            fontSize: '18px',
                            color: 'rgba(255, 0, 255, 0.8)',
                            marginTop: '8px',
                          }}
                        >
                          Vacantes
                        </p>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#1a1a1a',
                          padding: '24px',
                          borderRadius: '12px',
                          border: '2px solid rgba(168, 85, 247, 0.3)',
                        }}
                      >
                        <p
                          style={{ fontSize: '48px', fontWeight: 900, color: '#a855f7', margin: 0 }}
                        >
                          {resultadoSuccion.sincronizacion?.actualizadas || 0}
                        </p>
                        <p
                          style={{
                            fontSize: '18px',
                            color: 'rgba(168, 85, 247, 0.8)',
                            marginTop: '8px',
                          }}
                        >
                          Actualizadas
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '24px',
                        backgroundColor: '#000000',
                        borderRadius: '12px',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                      }}
                    >
                      <pre
                        style={{
                          color: '#00FF41',
                          fontSize: '18px',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                        }}
                      >
                        {resultadoSuccion.resumen}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Botón Publicar Facebook GRANDE */}
                <button
                  onClick={handlePublicarFacebook}
                  disabled={!resultadoSuccion || publicando}
                  className={`w-full px-12 py-8 rounded-3xl font-black text-4xl transition-all duration-300 shadow-2xl ${
                    !resultadoSuccion || publicando
                      ? 'bg-gray-700 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-black hover:scale-105 hover:shadow-cyan-500/60'
                  }`}
                >
                  {publicando ? '📤 PUBLICANDO...' : '📢 PUBLICAR EN FACEBOOK'}
                </button>

                {/* Info GRANDE */}
                <div className="mt-8 p-6 bg-black/40 rounded-xl border-2 border-fuchsia-500/30">
                  <p className="text-base text-fuchsia-300/70 font-mono leading-relaxed">
                    💡 <strong className="text-fuchsia-400">Funcionamiento:</strong> La Aspiradora
                    3000 lee los últimos 300 mensajes del grupo seleccionado, los procesa con Groq
                    IA (Llama 3.3 70B - FREE) para detectar vacantes (empresa, puesto, salario,
                    horario, rutas), y las sincroniza automáticamente con Firebase. Sistema
                    conectado permanentemente al WhatsApp corporativo. Todo gratis, sin APIs de
                    pago. Delays anti-detección incluidos. ✅
                  </p>
                </div>
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
                            {vacante.requisitos?.experiencia || '-'}
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate text-gray-300">
                            {vacante.empresa} - {vacante.horario.jornadaTipo}
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

        {/* Modal de Confirmación */}
        {mostrarConfirmacion && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-fuchsia-900/90 to-purple-900/90 border-4 border-fuchsia-500 rounded-2xl p-8 max-w-md shadow-2xl">
              <h3 className="text-3xl font-black text-fuchsia-300 mb-4">⚠️ CONFIRMAR SUCCIÓN</h3>
              <p className="text-white text-lg mb-6">
                ¿Autoriza que la <strong className="text-fuchsia-400">Aspiradora 3000</strong>{' '}
                succione los últimos <strong>300 mensajes</strong> del grupo seleccionado?
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
      </div>{' '}
      {/* Cierre contenido principal */}
    </div>
  );
}
