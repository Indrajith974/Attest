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
                // Professional document-like color palette
                primary: {
                    50: '#f0f4f8',
                    100: '#d9e2ec',
                    200: '#bcccdc',
                    300: '#9fb3c8',
                    400: '#829ab1',
                    500: '#627d98',
                    600: '#486581',
                    700: '#334e68',
                    800: '#243b53',
                    900: '#102a43',
                },
                accent: {
                    50: '#e6f6ff',
                    100: '#bae3ff',
                    200: '#7cc4fa',
                    300: '#47a3f3',
                    400: '#2186eb',
                    500: '#0967d2',
                    600: '#0552b5',
                    700: '#03449e',
                    800: '#01337d',
                    900: '#002159',
                },
                success: {
                    50: '#e3f9e5',
                    100: '#c1eac5',
                    200: '#a3d9a5',
                    300: '#7bc47f',
                    400: '#57ae5b',
                    500: '#3f9142',
                    600: '#2f8132',
                    700: '#207227',
                    800: '#0e5814',
                    900: '#05400a',
                },
                warning: {
                    50: '#fff3c4',
                    100: '#fce588',
                    200: '#fadb5f',
                    300: '#f7c948',
                    400: '#f0b429',
                    500: '#de911d',
                    600: '#cb6e17',
                    700: '#b44d12',
                    800: '#8d2b0b',
                    900: '#6e1906',
                },
                danger: {
                    50: '#ffe3e3',
                    100: '#ffbdbd',
                    200: '#ff9b9b',
                    300: '#f86a6a',
                    400: '#ef4e4e',
                    500: '#e12d39',
                    600: '#cf1124',
                    700: '#ab091e',
                    800: '#8a041a',
                    900: '#610316',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'Georgia', 'serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            boxShadow: {
                'document': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
                'document-lg': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            }
        },
    },
    plugins: [],
}
