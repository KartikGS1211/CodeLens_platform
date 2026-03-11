export { renderers } from '../../../../../renderers.mjs';

// src/routes/servicePlugins.ts
var ALL = async (context) => {
  const extensions = /* #__PURE__ */ Object.assign({

});
  if (context.params.compId == null) {
    return new Response(null, { status: 404 });
  }
  const load = extensions[`.astro/integrations/_wix_astro_backend-extensions/service-plugins/${context.params.compId}/entry.ts`];
  if (load == null) {
    return new Response(null, { status: 404 });
  }
  const { default: run } = await load();
  return run(context);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
