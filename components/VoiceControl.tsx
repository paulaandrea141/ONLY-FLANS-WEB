import { useState, useEffect } from 'react';

interface VoiceControlProps {
  onVoiceCommand: (comando: string) => void;
}

/**
 * 🎤 CONTROL DE VOZ - CORP. TYRELL
 * Tech Lead: Paula Specter (@SpecterTech)
 *
 * Usa Web Speech API (GRATIS, nativa del navegador)
 * Reconocimiento en español mexicano
 */
export default function VoiceControl({ onVoiceCommand }: VoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Verificar soporte del navegador
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-MX'; // Español de México

      recognitionInstance.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          onVoiceCommand(transcriptText);
          setTranscript('');
          setIsListening(false);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Error de reconocimiento:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onVoiceCommand]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleListening}
        className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]'
            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
        }`}
      >
        {isListening ? '🔴 ESCUCHANDO...' : '🎤 ACTIVAR VOZ'}
      </button>

      {transcript && (
        <div className="flex-1 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-400 text-sm font-mono">📝 "{transcript}"</p>
        </div>
      )}
    </div>
  );
}
