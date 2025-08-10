import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const target = env.VITE_API_URL || process.env.VITE_API_URL;

  return {
    base: './', // ensures assets work from any path
    plugins: [react()],
    resolve: {
      alias: {
        '@api': '/src/api',
        '@components': '/src/components',
        '@services': '/src/services',
        '@pages': '/src/pages',
        '@utils': '/src/utils',
        '@assets': '/src/assets',
        '@context': '/src/context',
      },
    },
    server: {
      cors: true,
      proxy: target
        ? {
            '/api': {
              target,
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
