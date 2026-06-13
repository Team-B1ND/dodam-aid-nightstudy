import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const createDodamProxy = () => ({
        target: env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
    });

    return {
        plugins: [react()],
        base: './',
        server: {
            proxy: {
                '/nightstudy': createDodamProxy(),
                '/auth': createDodamProxy(),
                '/user': createDodamProxy(),
                '/oauth': createDodamProxy(),
            },
        },
    };
});