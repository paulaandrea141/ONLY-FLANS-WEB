import { useState, useEffect } from 'react';

interface FireballSwitchProps {
  onToggle?: (isActive: boolean) => void;
  initialState?: boolean;
  label?: string;
}

export const FireballSwitch = ({
  onToggle,
  initialState = false,
  label = 'IA BOT',
}: FireballSwitchProps) => {
  const [isActive, setIsActive] = useState(initialState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle?.(newState);
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div>
        <p className="text-white font-bold text-sm">{label}</p>
        <p className="text-cyan-300/50 font-mono text-xs">
          {isActive ? '🔥 ACTIVO' : '❄️ INACTIVO'}
        </p>
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`relative inline-flex items-center justify-center w-16 h-8 rounded-full border-2 transition-all duration-500 cursor-pointer ${
          isActive
            ? 'border-orange-500/80 bg-gradient-to-r from-orange-500/30 to-red-500/30'
            : 'border-cyan-500/50 bg-cyan-500/10'
        }`}
      >
        {/* Inner circle */}
        <div
          className={`absolute w-6 h-6 rounded-full transition-all duration-500 ${
            isActive
              ? 'translate-x-4 bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/50'
              : '-translate-x-4 bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30'
          }`}
        />

        {/* Glow effect */}
        {isActive && (
          <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-orange-500/20 to-red-500/20" />
        )}

        {/* Fire particles */}
        {isActive && (
          <>
            <div className="absolute top-0 left-1 w-1 h-1 bg-orange-300 rounded-full animate-ping" />
            <div className="absolute top-1 right-1 w-1 h-1 bg-red-300 rounded-full animate-pulse" />
            <div className="absolute bottom-1 left-0 w-1 h-1 bg-orange-400 rounded-full animate-bounce" />
          </>
        )}
      </button>

      {/* Status Indicator */}
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full animate-pulse transition-all duration-300 ${
            isActive
              ? 'bg-orange-400 shadow-lg shadow-orange-400/50'
              : 'bg-cyan-400 shadow-lg shadow-cyan-400/30'
          }`}
        />
      </div>
    </div>
  );
};

export default FireballSwitch;
