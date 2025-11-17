/**
 * Bundle Size Limits Configuration
 * This file defines maximum bundle sizes to prevent performance regression
 * 
 * Run: npm run analyze to generate bundle analysis
 */

module.exports = {
    // Maximum sizes for different bundle types (in bytes)
    limits: [
        {
            path: '.next/static/chunks/pages/**/*.js',
            limit: '150 KB',
            name: 'Page bundles',
        },
        {
            path: '.next/static/chunks/**/*.js',
            limit: '250 KB',
            name: 'Chunk bundles',
        },
        {
            path: '.next/static/css/**/*.css',
            limit: '50 KB',
            name: 'CSS bundles',
        },
        {
            path: '.next/static/media/**/*',
            limit: '100 KB',
            name: 'Media files',
        },
    ],

    // Ignore certain files from size checks
    ignore: [
        '.next/static/chunks/framework-*',
        '.next/static/chunks/main-*',
        '.next/static/chunks/webpack-*',
        '.next/static/chunks/polyfills-*',
    ],

    // CI integration
    ci: {
        // Fail CI if bundle size exceeds limits
        failOnExceed: true,

        // Comment on PR with bundle size changes
        commentOnPR: true,

        // Threshold for warning (percentage increase)
        warningThreshold: 10,

        // Threshold for error (percentage increase)
        errorThreshold: 20,
    },

    // Compression
    compression: {
        // Enable gzip analysis
        gzip: true,

        // Enable brotli analysis
        brotli: true,
    },

    // Performance budgets for different pages
    pageBudgets: {
        '/': {
            javascript: '200 KB',
            css: '30 KB',
            images: '300 KB',
            fonts: '80 KB',
            total: '600 KB',
        },
        '/map': {
            javascript: '300 KB', // Google Maps library
            css: '40 KB',
            images: '200 KB',
            fonts: '80 KB',
            total: '700 KB',
        },
        '/compare': {
            javascript: '180 KB',
            css: '35 KB',
            images: '250 KB',
            fonts: '80 KB',
            total: '550 KB',
        },
        '/provider/[id]': {
            javascript: '190 KB',
            css: '35 KB',
            images: '400 KB',
            fonts: '80 KB',
            total: '700 KB',
        },
    },

    // Core Web Vitals thresholds
    coreWebVitals: {
        // Largest Contentful Paint (LCP)
        lcp: {
            good: 2500,
            needsImprovement: 4000,
        },

        // First Input Delay (FID)
        fid: {
            good: 100,
            needsImprovement: 300,
        },

        // Cumulative Layout Shift (CLS)
        cls: {
            good: 0.1,
            needsImprovement: 0.25,
        },

        // First Contentful Paint (FCP)
        fcp: {
            good: 1800,
            needsImprovement: 3000,
        },

        // Time to Interactive (TTI)
        tti: {
            good: 3800,
            needsImprovement: 7300,
        },

        // Total Blocking Time (TBT)
        tbt: {
            good: 300,
            needsImprovement: 600,
        },
    },
};
