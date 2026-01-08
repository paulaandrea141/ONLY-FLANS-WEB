export const RadarScan = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      {/* Radar Container */}
      <div className="relative w-48 h-48 mb-8">
        {/* Outer Circle */}
        <div className="absolute inset-0 rounded-full border border-purple-500/30" />

        {/* Middle Circle */}
        <div className="absolute inset-4 rounded-full border border-purple-500/20" />

        {/* Inner Circle */}
        <div className="absolute inset-8 rounded-full border border-purple-500/10" />

        {/* Radar Lines (Cross) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Vertical Line */}
          <div className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
          {/* Horizontal Line */}
          <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        </div>

        {/* Scanning Beam 1 (Cyan) */}
        <div className="absolute inset-0 animate-radar-scan-1">
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-cyan-400/80 border-r-transparent border-b-transparent" />
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-cyan-400/40 border-r-transparent border-b-transparent scale-75" />
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-cyan-400/20 border-r-transparent border-b-transparent scale-50" />
        </div>

        {/* Scanning Beam 2 (Purple) - Offset 120 degrees */}
        <div className="absolute inset-0 animate-radar-scan-2">
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-purple-400/80 border-r-transparent border-b-transparent" />
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-purple-400/40 border-r-transparent border-b-transparent scale-75" />
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-purple-400/20 border-r-transparent border-b-transparent scale-50" />
        </div>

        {/* Scanning Beam 3 (Pink) - Offset 240 degrees */}
        <div className="absolute inset-0 animate-radar-scan-3">
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-pink-400/80 border-r-transparent border-b-transparent" />
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-pink-400/40 border-r-transparent border-b-transparent scale-75" />
          <div className="absolute inset-0 rounded-full border-l-2 border-t-2 border-pink-400/20 border-r-transparent border-b-transparent scale-50" />
        </div>

        {/* Center Glow Dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 opacity-40 animate-ping" />

        {/* Pulse Rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-pulse-ring" />
        <div className="absolute inset-2 rounded-full border border-purple-400/20 animate-pulse-ring-delay" />
      </div>

      {/* Text Content */}
      <div className="text-center space-y-2">
        <p className="text-cyan-400 font-mono text-lg animate-pulse">🔍 ESCANEANDO RED...</p>
        <p className="text-purple-300/70 font-mono text-sm">
          La IA está buscando candidatos activamente
        </p>
        <p className="text-pink-300/50 font-mono text-xs mt-4">
          Esperando nuevos reclutados desde WhatsApp
        </p>
      </div>

      {/* Loading Bars */}
      <div className="mt-8 w-48 space-y-1">
        <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full animate-loading-bar-1" />
        <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full animate-loading-bar-2" />
        <div className="h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent rounded-full animate-loading-bar-3" />
      </div>
    </div>
  );
};
