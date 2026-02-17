import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Fantasy Theme Colors
        fantasy: {
          // Backgrounds
          'bg-primary': '#1a1410',
          'bg-secondary': '#2d241c',
          'bg-card': '#F4E4BC',
          'bg-card-dark': '#E8D4A8',
          
          // Text
          'text-primary': '#3D2914',
          'text-secondary': '#5D4934',
          'text-light': '#F4E4BC',
          'text-gold': '#D4AF37',
          
          // Accents
          gold: '#D4AF37',
          'gold-hover': '#B8860B',
          red: '#8B0000',
          green: '#228B22',
          blue: '#4169E1',
          purple: '#4B0082',
          
          // Borders
          'border-gold': '#D4AF37',
          'border-dark': '#3D2914',
        },
        
        // Item Rarity Colors
        rarity: {
          common: '#808080',
          uncommon: '#1EFF00',
          rare: '#0070DD',
          epic: '#A335EE',
          legendary: '#FF8000',
          mythic: '#E6CC80',
        },
      },
      fontFamily: {
        heading: ['Cinzel', 'serif'],
        'heading-decorative': ['Cinzel Decorative', 'serif'],
        body: ['Crimson Text', 'serif'],
        ui: ['Cormorant Garamond', 'serif'],
        mono: ['Fira Code', 'monospace'],
      },
      backgroundImage: {
        'parchment': 'linear-gradient(135deg, #F4E4BC 0%, #E8D4A8 100%)',
        'dark-wood': 'linear-gradient(180deg, #3D2914 0%, #2D241C 100%)',
        'gold-gradient': 'linear-gradient(180deg, #D4AF37 0%, #B8860B 100%)',
        'gold-gradient-hover': 'linear-gradient(180deg, #E8C547 0%, #D4AF37 100%)',
      },
      boxShadow: {
        'fantasy': 'inset 0 0 20px rgba(139, 115, 85, 0.1), 0 4px 12px rgba(0,0,0,0.3)',
        'fantasy-dark': 'inset 0 2px 4px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.5)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'gold-glow-strong': '0 0 20px rgba(212, 175, 55, 0.8)',
      },
      animation: {
        'fade-in-scale': 'fadeInScale 0.3s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
