import { e as elevate } from '../../chunks/chunk-656BVIJ3_CvTtNdIb.mjs';
import { ok } from 'assert';
import { oAuthApps } from '@wix/auth-management';
import { W as WIX_CLIENT_ID } from '../../chunks/client_CYGeep-0.mjs';
export { renderers } from '../../renderers.mjs';

var GET = async ({ url }) => {
  const { redirectUrlWixPages } = await elevate(oAuthApps.getOAuthApp)(
    WIX_CLIENT_ID
  );
  ok(redirectUrlWixPages != null);
  const baseUrl = redirectUrlWixPages.endsWith("/") ? redirectUrlWixPages : `${redirectUrlWixPages}/`;
  const newCheckoutUrl = new URL(url.pathname.replace("/", ""), baseUrl);
  newCheckoutUrl.search = url.search;
  return new Response(null, {
    headers: { Location: newCheckoutUrl.toString() },
    status: 302
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
