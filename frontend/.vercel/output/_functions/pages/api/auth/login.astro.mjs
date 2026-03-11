import { o as object, s as string2, _ as _enum } from '../../../chunks/chunk-BIARYLOZ_CECuIBha.mjs';
import { a as auth, o as oAuthStateCookieName } from '../../../chunks/chunk-YHKPE45V_t44cTj_m.mjs';
export { renderers } from '../../../renderers.mjs';

var loginSearchParams = object({
  prompt: _enum(["login", "none"]).optional(),
  returnToUrl: string2().optional()
});
var GET = async ({ request, url }) => {
  const { prompt, returnToUrl = "/" } = loginSearchParams.parse(
    Object.fromEntries(url.searchParams.entries())
  );
  const callbackUrl = new URL("/api/auth/callback", url);
  const referer = request.headers.get("referer");
  if (referer != null) {
    const originalUrl = new URL(referer);
    callbackUrl.protocol = originalUrl.protocol;
  }
  const oauthData = auth.generateOAuthData(callbackUrl.toString(), returnToUrl);
  const { authUrl } = await auth.getAuthUrl(oauthData, {
    prompt,
    responseMode: "query"
  });
  const sameSite = "Lax";
  return new Response(null, {
    headers: {
      Location: authUrl,
      "Set-Cookie": `${oAuthStateCookieName}=${JSON.stringify(
        oauthData
      )}; Max-Age=1800; Path=/; HttpOnly; Secure; SameSite=${sameSite}`
    },
    status: 302
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
