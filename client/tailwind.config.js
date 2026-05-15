/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: { 500: '#6366f1', 600: '#4f46e5' },
                accent: { 500: '#f59e0b', 600: '#d97706' },
                dark: { 900: '#0f172a' },
            },
        },
    },
    plugins: [],
}
