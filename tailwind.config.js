module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Courier Prime', 'monospace'],
        tech: ['Orbitron', 'sans-serif'],
      },
      colors: {
        cyberpunk: {
          dark: '#000000',
          darker: '#0a0a0a',
          cyan: '#00f0ff',
          purple: '#c026d3',
          pink: '#ec4899',
          green: '#10b981',
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '40px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scan-line 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'radar-scan-1': 'radar-scan-1 4s linear infinite',
        'radar-scan-2': 'radar-scan-2 4s linear infinite',
        'radar-scan-3': 'radar-scan-3 4s linear infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'pulse-ring-delay': 'pulse-ring-delay 2s 0.5s infinite',
        'loading-bar-1': 'loading-bar-1 2s ease-in-out infinite',
        'loading-bar-2': 'loading-bar-2 2s ease-in-out infinite',
        'loading-bar-3': 'loading-bar-3 2s ease-in-out infinite',
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0, 240, 255, 0.3), 0 0 60px rgba(0, 240, 255, 0.1)',
        'glow-purple': '0 0 30px rgba(192, 38, 211, 0.3), 0 0 60px rgba(192, 38, 211, 0.1)',
        'glow-pink': '0 0 30px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)',
        'inset-glow': 'inset 0 0 20px rgba(0, 240, 255, 0.2)',
      },
      textShadow: {
        'glow-cyan': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'glow-purple': '0 0 10px rgba(192, 38, 211, 0.5), 0 0 20px rgba(192, 38, 211, 0.3)',
      },
    },
  },
  plugins: [],
}
