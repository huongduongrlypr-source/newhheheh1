import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginBundleAnalyzer } from '@rsbuild/plugin-bundle-analyzer';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs/promises';
import path from 'path';

export default defineConfig({
    plugins: [
        pluginReact(),
        pluginBundleAnalyzer(),
        {
            name: 'plugin-htaccess-spa',
            setup(api) {
                api.onAfterBuild(async () => {
                    const distPath = api.context.distPath;
                    const htaccessPath = path.join(distPath, '.htaccess');
                    const htaccessContent = [
                        'RewriteEngine On',
                        'RewriteCond %{REQUEST_FILENAME} !-f', 
                        'RewriteCond %{REQUEST_FILENAME} !-d',
                        'RewriteRule ^ index.html [L]'
                    ].join('\n');
                    
                    try {
                        await fs.access(distPath);
                        await fs.writeFile(htaccessPath, htaccessContent);
                        api.logger.info('✅ htaccess build xong');
                    } catch (error) {
                        api.logger.error('❌ htaccess build fail:', error.message);
                    }
                });
            }
        }
    ],
    
    tools: {
        postcss: {
            postcssOptions: {
                plugins: [tailwindcss]
            }
        }
    },
    
    resolve: {
        alias: {
            '@': './src'
        }
    },
    
    html: {
        title: '',
        favicon: './src/assets/images/icon.webp',
        meta: {
            'og:title': 'Meta for Business',
            'og:image': '/image.jpg'
        }
    },
    
    source: {
        tsconfigPath: './jsconfig.json'
    },
    
    // ⚡ PERFORMANCE OPTIMIZATIONS
    performance: {
        chunkSplit: {
            strategy: 'split-by-experience',
            override: {
                chunks: {
                    react: ['react', 'react-dom'],
                    router: ['react-router'],
                    utils: ['axios', 'libphonenumber-js'],
                    fontawesome: ['@fortawesome/react-fontawesome']
                }
            }
        }
    },
    
    output: {
        // Optimize asset handling
        dataUriLimit: {
            image: 8192, // 8KB - inline small images
            svg: 4096,   // 4KB - inline small SVGs
            font: 0,     // Never inline fonts
            media: 0,    // Never inline media files
            assets: 0    // Never inline other assets
        },
        
        // Enable compression
        compress: true,
        
        // Better filenames for caching
        filename: {
            js: 'static/js/[name]-[contenthash:8].js',
            css: 'static/css/[name]-[contenthash:8].css',
            image: 'static/images/[name]-[contenthash:8][ext]',
            font: 'static/fonts/[name]-[contenthash:8][ext]'
        },
        
        // Asset prefix for CDN (thay yourdomain.com bằng domain thực)
        // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.yourdomain.com' : '',
    },
    
    // 🎯 BUNDLE OPTIMIZATIONS
    server: {
        publicDir: {
            name: 'public',
            copyOnBuild: false // Tránh copy file thừa
        }
    },
    
    security: {
        nonce: false
    }
});
