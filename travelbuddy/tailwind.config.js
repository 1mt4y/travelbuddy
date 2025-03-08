/** @type {import('tailwindcss').Config} */
const config = {
    darkMode: ["class", '[data-theme="dark"]'],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    hover: "var(--primary-hover)",
                    light: "var(--primary-light)",
                    dark: "var(--primary-dark)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    light: "var(--secondary-light)",
                },
                accent: "var(--accent)",
                success: "var(--success)",
                warning: "var(--warning)",
                danger: "var(--danger)",
                muted: "var(--muted)",
                card: "var(--card)",
                border: "var(--border)",
            },
            fontFamily: {
                sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
                mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "Courier New", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius, 0.5rem)",
                md: "calc(var(--radius, 0.5rem) - 2px)",
                sm: "calc(var(--radius, 0.5rem) - 4px)",
            },
            boxShadow: {
                card: "0 2px 8px -1px rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
            },
        },
    },
    plugins: [],
};

export default config;