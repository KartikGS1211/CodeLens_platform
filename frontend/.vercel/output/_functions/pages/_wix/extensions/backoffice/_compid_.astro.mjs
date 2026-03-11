import '../../../../chunks/page-ssr_CxHm9BpT.mjs';
import { c as createComponent, a as createAstro, r as renderComponent, b as renderTemplate } from '../../../../chunks/astro/server_NvjO89Nx.mjs';
import 'kleur/colors';
export { renderers } from '../../../../renderers.mjs';

const $$Astro = createAstro();
const $$Entry = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Entry;
  const extensions = /* #__PURE__ */ Object.assign({

});
  if (Astro2.params.compId == null) {
    return new Response(null, { status: 404 });
  }
  const load = extensions[`.astro/integrations/_wix_astro_backoffice-extensions/backoffice/${Astro2.params.compId}/entry.astro`];
  if (load == null) {
    return new Response(null, { status: 404 });
  }
  const mod = await load();
  if (mod == null || typeof mod !== "object" || !("default" in mod)) {
    return new Response(null, { status: 404 });
  }
  const Component = mod.default;
  return renderTemplate`${renderComponent($$result, "Component", Component, {})}`;
}, "C:/Users/Kartik Sarode/OneDrive/Desktop/Projects/Kartik/CodeLens_AI/frontend/node_modules/@wix/astro/build/dependencies/astro-backoffice-extensions/astro-runtime/entry.astro", void 0);

const $$file = "C:/Users/Kartik Sarode/OneDrive/Desktop/Projects/Kartik/CodeLens_AI/frontend/node_modules/@wix/astro/build/dependencies/astro-backoffice-extensions/astro-runtime/entry.astro";
const $$url = undefined;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Entry,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
