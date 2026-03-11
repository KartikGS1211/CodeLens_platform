import { ok } from 'assert';
import { oAuthApps } from '@wix/auth-management';
import { W as WIX_CLIENT_ID } from '../../chunks/client_CYGeep-0.mjs';
import { createRESTModule } from '@wix/sdk-runtime/rest-modules';
export { renderers } from '../../renderers.mjs';

// src/routes/api.ts
function elevate(restModule) {
  return createRESTModule(restModule, true);
}

// src/routes/api.ts
var GET = async ({ url }) => {
  const { redirectUrlWixPages } = await elevate(oAuthApps.getOAuthApp)(
    WIX_CLIENT_ID
  );
  ok(redirectUrlWixPages != null);
  const baseWixUrl = new URL(redirectUrlWixPages);
  const mergedPath = baseWixUrl.pathname.replace(/\/$/, "") + url.pathname.replace(/\/$/, "");
  const redirectUrl = new URL(mergedPath, baseWixUrl.origin);
  for (const [key, value] of [
    ...baseWixUrl.searchParams.entries(),
    ...url.searchParams.entries()
  ]) {
    redirectUrl.searchParams.append(key, value);
  }
  return new Response(null, {
    headers: { Location: redirectUrl.toString() },
    status: 302
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
