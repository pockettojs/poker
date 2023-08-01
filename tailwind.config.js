/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                automate: {
                    '50': '#f2f9fc',
                    '100': '#e6f0f5',
                    '200': '#b3d1e1',
                    '300': '#80b2cd',
                    '400': '#3887B3',
                    '500': '#3278A0',
                    '600': '#2B6789',
                    '700': '#235571',
                    '750': '#204C66',
                    '800': '#1C445A',
                    '850': '#183B4E',
                    '900': '#153243',
                },
            }
        },
    },
    plugins: [],
};

