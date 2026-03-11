import { ok } from 'assert';
import { oAuthApps } from '@wix/auth-management';
import { W as WIX_CLIENT_ID } from '../chunks/client_CYGeep-0.mjs';
import { createRESTModule } from '@wix/sdk-runtime/rest-modules';
export { renderers } from '../renderers.mjs';

// src/routes/robots.ts
function elevate(restModule) {
  return createRESTModule(restModule, true);
}

// src/routes/robots.ts
var GET = async ({ request }) => {
  const { redirectUrlWixPages } = await elevate(oAuthApps.getOAuthApp)(
    WIX_CLIENT_ID
  );
  ok(redirectUrlWixPages != null);
  const baseUrl = redirectUrlWixPages.endsWith("/") ? redirectUrlWixPages : `${redirectUrlWixPages}/`;
  const robotsUrl = new URL("robots.txt", baseUrl);
  const userAgent = request.headers.get("user-agent");
  const originalResponse = await fetch(robotsUrl, {
    headers: { ...userAgent != null ? { "User-Agent": userAgent } : {} }
  });
  if (!originalResponse.ok) {
    throw new Error(
      `Failed to retrieve original robots.txt from: \`${robotsUrl.toString()}\`. Error: \`${originalResponse.statusText}\``
    );
  }
  const contentType = originalResponse.headers.get("content-type");
  return new Response(originalResponse.body, {
    headers: {
      ...contentType != null ? { "Content-Type": contentType } : {}
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
