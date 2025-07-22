import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

const hmrHost = '192.168.1.40';

export default defineConfig({
    plugins: [    tailwindcss(),  ],
    server:{
        host: '0.0.0.0',
        port: 5173,
        https: {
            key: fs.readFileSync(path.resolve(__dirname, 'cert/key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'cert/cert.pem')),
        },
        hmr: {
            port: 5173,
            host: hmrHost,
            protocol: 'wss',
        },
        proxy: {
        '/api': {
            target: 'https://backend:2807',
            changeOrigin: true,
            secure: false
        }
    }
    },
});