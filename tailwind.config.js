/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#059669", // Verde esmeralda - sostenibilidad
        secondary: "#0EA5E9", // Azul cielo - medio ambiente
        accent: "#10B981", // Verde esmeralda claro
        neutral: "#64748B", // Gris azulado
        "base-100": "#FFFFFF",
        "base-200": "#F1F5F9", // Gris muy claro con tinte azulado
        "base-300": "#E2E8F0", // Gris claro con tinte azulado
        info: "#0EA5E9", // Azul información
        success: "#059669", // Verde éxito
        warning: "#F59E0B", // Amarillo advertencia
        error: "#EF4444", // Rojo error
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#059669", // Verde esmeralda - sostenibilidad
          "secondary": "#0EA5E9", // Azul cielo - medio ambiente
          "accent": "#10B981", // Verde esmeralda claro
          "neutral": "#64748B", // Gris azulado
          "base-100": "#FFFFFF",
          "base-200": "#F1F5F9", // Gris muy claro con tinte azulado
          "base-300": "#E2E8F0", // Gris claro con tinte azulado
          "info": "#0EA5E9", // Azul información
          "success": "#059669", // Verde éxito
          "warning": "#F59E0B", // Amarillo advertencia
          "error": "#EF4444", // Rojo error
        },
        dark: {
          "primary": "#10B981", // Verde esmeralda claro para modo oscuro
          "secondary": "#38BDF8", // Azul cielo claro para modo oscuro
          "accent": "#34D399", // Verde esmeralda más claro
          "neutral": "#94A3B8", // Gris azulado claro
          "base-100": "#0F172A", // Azul muy oscuro
          "base-200": "#1E293B", // Azul oscuro
          "base-300": "#334155", // Azul grisáceo
          "info": "#38BDF8", // Azul información claro
          "success": "#10B981", // Verde éxito claro
          "warning": "#FBBF24", // Amarillo advertencia claro
          "error": "#F87171", // Rojo error claro
        }
      }
    ],
  },
}
