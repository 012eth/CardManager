// @ts-nocheck
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import VitePluginHtmlEnv from 'vite-plugin-html-env';

// https://vitejs.dev/config/
export default args => {
    return defineConfig({
        build: {
            sourcemap: 'hidden',
        },
        plugins: [
            VitePluginHtmlEnv(),
            react({
                babel: {
                    plugins: [
                        [
                            '@emotion/babel-plugin',
                            {
                                sourceMap: false,
                                autoLabel: 'dev-only',
                                labelFormat: '[local]',
                                cssPropOptimization: true,
                            },
                        ],
                    ],
                },
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    });
};
