import { s as saveSessionTokensToCookie } from '../../../chunks/chunk-HPW4ZAEJ_c0-q52By.mjs';
import { r as returnToQueryParamName, a as auth } from '../../../chunks/chunk-YHKPE45V_t44cTj_m.mjs';
export { renderers } from '../../../renderers.mjs';

// src/routes/logout-callback.ts
var GET = async (context) => {
  const returnTo = context.url.searchParams.get(returnToQueryParamName) ?? "/";
  if (!returnTo.startsWith("/")) {
    throw new Error(
      `Invalid \`${returnToQueryParamName}\` query param, only relative URLs are allowed`
    );
  }
  saveSessionTokensToCookie(context, await auth.generateVisitorTokens());
  return context.redirect(returnTo);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
