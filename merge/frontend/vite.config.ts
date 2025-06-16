import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

const hmrHost = '10.0.2.15';

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
            host: hmrHost,
            protocol: 'wss',
        },
    },
});