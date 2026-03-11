import { s as saveSessionTokensToCookie } from '../../../chunks/chunk-HPW4ZAEJ_c0-q52By.mjs';
import { o as object, s as string2 } from '../../../chunks/chunk-BIARYLOZ_CECuIBha.mjs';
import { o as oAuthStateCookieName, a as auth } from '../../../chunks/chunk-YHKPE45V_t44cTj_m.mjs';
export { renderers } from '../../../renderers.mjs';

// src/routes/callback.ts
var oauthCookieSchema = object({
  codeChallenge: string2(),
  codeVerifier: string2(),
  originalUri: string2(),
  redirectUri: string2(),
  state: string2()
});
var GET = async (context) => {
  const oauthStateCookie = context.cookies.get(oAuthStateCookieName);
  if (oauthStateCookie == null) {
    throw new Error(`Missing \`${oAuthStateCookieName}\` cookie`);
  }
  const oauthData = oauthCookieSchema.parse(JSON.parse(oauthStateCookie.value));
  if (!oauthData.originalUri.startsWith("/")) {
    throw new Error(
      "Invalid `originalUri` cookie param, only relative URLs are allowed"
    );
  }
  const { code, error, errorDescription, state } = auth.parseFromUrl(
    context.url.toString(),
    "query"
  );
  if (error != null) {
    throw new Error(`Error while authenticating: \`${errorDescription}\``);
  }
  const memberTokens = await auth.getMemberTokens(code, state, oauthData);
  context.cookies.delete(oAuthStateCookieName, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true
  });
  saveSessionTokensToCookie(context, memberTokens);
  return context.redirect(oauthData.originalUri);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
