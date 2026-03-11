import '../chunks/page-ssr_CxHm9BpT.mjs';
import { c as createComponent, d as renderHead, r as renderComponent, b as renderTemplate } from '../chunks/astro/server_NvjO89Nx.mjs';
import 'kleur/colors';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CodeLens AI</title>${renderHead()}</head> <body> ${renderComponent($$result, "AppRouter", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/Kartik Sarode/OneDrive/Desktop/Projects/Kartik/CodeLens_AI/frontend/src/components/AppRouter", "client:component-export": "default" })} </body></html>`;
}, "C:/Users/Kartik Sarode/OneDrive/Desktop/Projects/Kartik/CodeLens_AI/frontend/src/pages/index.astro", void 0);

const $$file = "C:/Users/Kartik Sarode/OneDrive/Desktop/Projects/Kartik/CodeLens_AI/frontend/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
