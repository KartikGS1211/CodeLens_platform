import { getContextualAuth } from '@wix/sdk-runtime/context';

// src/constants.ts
var oAuthStateCookieName = "oAuthState";
var returnToQueryParamName = "returnTo";
var auth = getContextualAuth();

export { auth as a, oAuthStateCookieName as o, returnToQueryParamName as r };
