/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "background-dark": "#1d2125",
                "sidebar-dark": "#18191A",
                "card-dark": "#2c333a",
                "hover-dark": "#a1bdd114",
                "border-dark": "#1F1F21",
                "text-muted": "#9fadbc",
                "text-main": "#CECFD2",
                "trello-blue": "#5794F7",
                "selection-bg": "#1c2b41",
                "primary": "#5794F7",
                "background-light": "#f6f7f8",
                "list-dark": "rgba(0, 0, 0, 0.9)",
            },
            fontFamily: {
                "sans": ["Inter", "sans-serif"],
                "display": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
            },
        },
    },
    darkMode: "class",
    plugins: [],
}
