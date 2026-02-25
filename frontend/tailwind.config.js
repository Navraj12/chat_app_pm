/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5',
                    light: '#818cf8',
                    dark: '#4338ca',
                },
                sidebar: {
                    DEFAULT: '#0f172a',
                    accent: '#1e293b',
                    hover: '#334155',
                },
                surface: {
                    DEFAULT: '#f8fafc',
                    accent: '#f1f5f9',
                }
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}