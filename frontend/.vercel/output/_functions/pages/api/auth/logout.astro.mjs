import { o as object, s as string2 } from '../../../chunks/chunk-BIARYLOZ_CECuIBha.mjs';
import { r as returnToQueryParamName, a as auth } from '../../../chunks/chunk-YHKPE45V_t44cTj_m.mjs';
export { renderers } from '../../../renderers.mjs';

var logoutSearchParams = object({
  returnToUrl: string2().optional()
});
var POST = async ({ redirect, request, url }) => {
  const { returnToUrl = "/" } = logoutSearchParams.parse(
    Object.fromEntries(url.searchParams.entries())
  );
  const baseUrl = `${new URL(request.url).origin}/${"/"}`;
  const postFlowUrl = new URL("/api/auth/logout-callback", baseUrl);
  const referer = request.headers.get("referer");
  if (referer != null) {
    const originalUrl = new URL(referer);
    postFlowUrl.protocol = originalUrl.protocol;
  }
  postFlowUrl.searchParams.set(returnToQueryParamName, returnToUrl);
  const { logoutUrl } = await auth.logout(postFlowUrl.toString());
  return redirect(logoutUrl);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
