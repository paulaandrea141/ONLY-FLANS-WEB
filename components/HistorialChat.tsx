import { useState, useEffect, useRef } from 'react';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'ia';
  contenido: string;
  timestamp: number;
  metadatos?: {
    tipoInput?: 'texto' | 'imagen' | 'voz';
    empresasDetectadas?: string[];
    accionTomada?: 'guardada' | 'rechazada' | 'pendiente';
  };
}

/**
 * 💬 HISTORIAL DE CHAT - CORP. TYRELL
 * CEO: Paula Andrea Hayle (Jessica Pearson)
 * Socio Mayoritario: Bob (Louis Litt)
 * Tech Lead: Paula Specter (@SpecterTech)
 */
export default function HistorialChat() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar historial inicial
  useEffect(() => {
    fetchHistorial();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchHistorial, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  const fetchHistorial = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/historial/ingesta`);
      const data = await res.json();

      if (data.success) {
        setMensajes(data.mensajes);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'texto':
        return '⌨️';
      case 'imagen':
        return '📸';
      case 'voz':
        return '🎤';
      default:
        return '💬';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">⚙️</div>
          <p className="text-orange-400 font-mono">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black border-l-2 border-orange-500/30">
      {/* Header */}
      <div className="p-4 border-b-2 border-orange-500/30 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">💬</span>
          <div>
            <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text">
              HISTORIAL DE INGESTA
            </h3>
            <p className="text-xs text-orange-300/60 font-mono mt-1">
              Conversaciones con Bob (Socio Mayoritario)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-mono">
            {mensajes.length} mensajes • Actualizado: {new Date().toLocaleTimeString('es-MX')}
          </span>
        </div>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-black/30"
      >
        {mensajes.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <p className="text-sm font-mono">No hay mensajes aún</p>
            <p className="text-xs mt-2 text-orange-300/60">
              Sube una captura del jefecito para empezar
            </p>
          </div>
        ) : (
          mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-4 ${
                  msg.tipo === 'usuario'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-black shadow-lg shadow-orange-500/50'
                    : 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-500/30 text-white backdrop-blur-sm'
                }`}
              >
                {/* Icono de tipo de input */}
                {msg.metadatos?.tipoInput && msg.tipo === 'usuario' && (
                  <div className="text-xs opacity-80 mb-2 font-mono flex items-center gap-2">
                    {getIconoTipo(msg.metadatos.tipoInput)}
                    <span>{msg.metadatos.tipoInput.toUpperCase()}</span>
                  </div>
                )}

                {/* Avatar */}
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{msg.tipo === 'usuario' ? '👑' : '🧠'}</div>
                  <div className="flex-1">
                    <div className="text-xs opacity-70 mb-1 font-bold">
                      {msg.tipo === 'usuario' ? 'PAULA ANDREA HAYLE' : 'BOB (SOCIO MAYORITARIO)'}
                    </div>

                    {/* Contenido */}
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.contenido}</p>

                    {/* Empresas detectadas */}
                    {msg.metadatos?.empresasDetectadas &&
                      msg.metadatos.empresasDetectadas.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.metadatos.empresasDetectadas.map((empresa, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-black/40 rounded text-xs font-bold border border-white/20"
                            >
                              🏢 {empresa}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Estado de acción */}
                    {msg.metadatos?.accionTomada && (
                      <div className="mt-2 text-xs font-mono opacity-70">
                        {msg.metadatos.accionTomada === 'guardada' && '✅ Publicada'}
                        {msg.metadatos.accionTomada === 'rechazada' && '❌ Rechazada'}
                        {msg.metadatos.accionTomada === 'pendiente' && '⏳ Pendiente'}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-xs opacity-60 mt-3 text-right font-mono">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer con stats */}
      <div className="p-3 border-t-2 border-orange-500/30 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="text-orange-300/60">
            📊 {mensajes.filter((m) => m.tipo === 'usuario').length} capturas analizadas
          </div>
          <div className="text-purple-300/60">
            🤖 {mensajes.filter((m) => m.tipo === 'ia').length} respuestas de Bob
          </div>
        </div>
      </div>
    </div>
  );
}
