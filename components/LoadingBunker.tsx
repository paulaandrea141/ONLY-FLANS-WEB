import { useEffect, useState } from 'react';

interface LoadingBunkerProps {
  message?: string;
  isError?: boolean;
}

export const LoadingBunker = ({
  message = 'ESTABLECIENDO CONEXIÓN CON EL BÚNKER...',
  isError = false,
}: LoadingBunkerProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(236, 72, 153, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Spinner */}
        <div className="relative w-32 h-32 mx-auto">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-fuchsia-500/30 rounded-full animate-spin-slow" />

          {/* Middle Ring */}
          <div className="absolute inset-2 border-4 border-cyan-500/30 rounded-full animate-spin-reverse" />

          {/* Inner Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-full animate-pulse"
              style={{
                boxShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(0, 240, 255, 0.5)',
              }}
            />
          </div>

          {/* Particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-fuchsia-500 rounded-full animate-ping"
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 60}deg) translateY(-60px)`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1
            className="text-3xl font-black tracking-wider"
            style={{
              color: '#ec4899',
              textShadow: '0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(236, 72, 153, 0.5)',
              fontFamily: 'Orbitron, monospace',
            }}
          >
            {message}
            {dots}
          </h1>

          {isError && (
            <div className="mt-6 space-y-2">
              <p className="text-red-400 text-sm font-mono">⚠️ ERROR DE CONEXIÓN</p>
              <p className="text-gray-500 text-xs">
                Verifica las credenciales de Firebase en .env.local
              </p>
            </div>
          )}

          {!isError && (
            <div className="flex items-center justify-center space-x-2 text-cyan-400 text-sm font-mono">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>SISTEMA TYRELL V2.0</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300" />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1 mx-auto bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 animate-pulse"
            style={{
              width: '100%',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.8)',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
};

export default LoadingBunker;
