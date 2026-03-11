import { e as elevate } from '../../chunks/chunk-656BVIJ3_CvTtNdIb.mjs';
import { ok } from 'assert';
import { oAuthApps } from '@wix/auth-management';
import { W as WIX_CLIENT_ID } from '../../chunks/client_CYGeep-0.mjs';
export { renderers } from '../../renderers.mjs';

var GET = async ({ params, redirect }) => {
  const { redirectUrlWixPages } = await elevate(oAuthApps.getOAuthApp)(
    WIX_CLIENT_ID
  );
  ok(redirectUrlWixPages != null);
  const baseUrl = redirectUrlWixPages.endsWith("/") ? redirectUrlWixPages : `${redirectUrlWixPages}/`;
  const paylinkUrl = new URL(`_paylink/${params.id}`, baseUrl);
  return redirect(paylinkUrl.toString(), 302);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
