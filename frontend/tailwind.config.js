/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#F8FAFC', // Canvas background (near-white / cool slate-50)
          900: '#FFFFFF', // Clean physical panel / card (pure white)
          850: '#F1F5F9', // Elevated card / inner header surface (slate-100)
          800: '#E2E8F0', // Card borders / hairline dividers (slate-200)
          700: '#CBD5E1', // Stronger borders / interactive boundaries (slate-300)
          600: '#94A3B8', // Muted borders / inactive items (slate-400)
          500: '#64748B', // Tertiary text / secondary captions (slate-500)
          400: '#475569', // Secondary body text (slate-600)
          300: '#334155', // Primary body text (slate-700)
          200: '#1E293B', // Subheadings / emphasis (slate-800)
          100: '#0F172A', // Primary headers / deep navy (slate-900)
        },
        sentinel: {
          cyan: '#0284C7',    // Aerospace deep sky / cyan-blue (high contrast)
          blue: '#2563EB',    // Technical sapphire / blue
          amber: '#D97706',   // Precision caution amber
          red: '#DC2626',     // Space critical red
          emerald: '#059669', // Verification pass emerald
          purple: '#7C3AED'   // Diagnostic violet
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'liquid': '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        'liquid-hover': '0 2px 8px -1px rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'liquid-pressed': '0 1px 1px 0 rgba(15, 23, 42, 0.04)',
        'liquid-focus': '0 0 0 2px rgba(2, 132, 199, 0.22)',
      }
    },
  },
  plugins: [],
}
