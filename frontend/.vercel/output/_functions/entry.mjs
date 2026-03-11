import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_BrtDZQM_.mjs';
import { manifest } from './manifest_Cvhep93f.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/__ecom/checkout.astro.mjs');
const _page2 = () => import('./pages/_api/_---path_.astro.mjs');
const _page3 = () => import('./pages/_paylink/_id_.astro.mjs');
const _page4 = () => import('./pages/_wix/extensions/backoffice/_compid_.astro.mjs');
const _page5 = () => import('./pages/_wix/extensions/service-plugins/_compid_/_---path_.astro.mjs');
const _page6 = () => import('./pages/_wix/extensions/webhooks/_compid_.astro.mjs');
const _page7 = () => import('./pages/api/auth/callback.astro.mjs');
const _page8 = () => import('./pages/api/auth/login.astro.mjs');
const _page9 = () => import('./pages/api/auth/logout.astro.mjs');
const _page10 = () => import('./pages/api/auth/logout-callback.astro.mjs');
const _page11 = () => import('./pages/__ecom/checkout.astro.mjs');
const _page12 = () => import('./pages/robots.txt.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["node_modules/@wix/astro/build/dependencies/astro-payment-links/backend-runtime/payment-checkout.js", _page1],
    ["node_modules/@wix/astro/build/dependencies/astro-viewer-api/backend-runtime/api.js", _page2],
    ["node_modules/@wix/astro/build/dependencies/astro-payment-links/backend-runtime/payment-link.js", _page3],
    ["node_modules/@wix/astro/build/dependencies/astro-backoffice-extensions/astro-runtime/entry.astro", _page4],
    ["node_modules/@wix/astro/build/dependencies/astro-backend-extensions/backend-runtime/routes/servicePlugins.js", _page5],
    ["node_modules/@wix/astro/build/dependencies/astro-backend-extensions/backend-runtime/routes/webhooks.js", _page6],
    ["node_modules/@wix/astro/build/dependencies/astro-auth/backend-runtime/routes/callback.js", _page7],
    ["node_modules/@wix/astro/build/dependencies/astro-auth/backend-runtime/routes/login.js", _page8],
    ["node_modules/@wix/astro/build/dependencies/astro-auth/backend-runtime/routes/logout.js", _page9],
    ["node_modules/@wix/astro/build/dependencies/astro-auth/backend-runtime/routes/logout-callback.js", _page10],
    ["node_modules/@wix/astro/build/dependencies/astro-payment-links/backend-runtime/payment-checkout.js", _page11],
    ["node_modules/@wix/astro/build/dependencies/astro-robots/backend-runtime/robots.js", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "middlewareSecret": "705aa4c0-2a09-45a8-ba95-39770303917b",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
