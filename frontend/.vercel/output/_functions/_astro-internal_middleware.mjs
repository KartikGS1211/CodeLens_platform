import 'es-module-lexer';
import './chunks/astro-designed-error-pages_B1F-MGpt.mjs';
import 'kleur/colors';
import './chunks/astro/server_NvjO89Nx.mjs';
import 'clsx';
import 'cookie';
import { c as createInvalidVariablesError, g as getEnv$1, s as setOnSetGetEnv, a as sequence } from './chunks/runtime_CqhDS9jS.mjs';
import { s as saveSessionTokensToCookie } from './chunks/chunk-HPW4ZAEJ_c0-q52By.mjs';
import { OAuthStrategy, createClient, AppStrategy, TokenRole } from '@wix/sdk';
import { W as WIX_CLIENT_ID } from './chunks/client_CYGeep-0.mjs';
import { AsyncLocalStorage } from 'async_hooks';
import { headlessNode } from '@wix/headless-node';
import * as z from 'zod';
import { scripts } from '@wix/headless-site-assets';

const schema = {"WIX_CLIENT_ID":{"access":"public","context":"client","type":"string"},"WIX_CLIENT_INSTANCE_ID":{"access":"secret","context":"server","type":"string"},"WIX_CLIENT_PUBLIC_KEY":{"access":"secret","context":"server","type":"string"},"WIX_CLIENT_SECRET":{"access":"secret","context":"server","type":"string"}};

function getEnvFieldType(options) {
  const optional = options.optional ? options.default !== void 0 ? false : true : false;
  let type;
  if (options.type === "enum") {
    type = options.values.map((v) => `'${v}'`).join(" | ");
  } else {
    type = options.type;
  }
  return `${type}${optional ? " | undefined" : ""}`;
}
const stringValidator = ({ max, min, length, url, includes, startsWith, endsWith }) => (input) => {
  if (typeof input !== "string") {
    return {
      ok: false,
      errors: ["type"]
    };
  }
  const errors = [];
  if (max !== void 0 && !(input.length <= max)) {
    errors.push("max");
  }
  if (min !== void 0 && !(input.length >= min)) {
    errors.push("min");
  }
  if (length !== void 0 && !(input.length === length)) {
    errors.push("length");
  }
  if (url !== void 0 && !URL.canParse(input)) {
    errors.push("url");
  }
  if (includes !== void 0 && !input.includes(includes)) {
    errors.push("includes");
  }
  if (startsWith !== void 0 && !input.startsWith(startsWith)) {
    errors.push("startsWith");
  }
  if (endsWith !== void 0 && !input.endsWith(endsWith)) {
    errors.push("endsWith");
  }
  if (errors.length > 0) {
    return {
      ok: false,
      errors
    };
  }
  return {
    ok: true,
    value: input
  };
};
const numberValidator = ({ gt, min, lt, max, int }) => (input) => {
  const num = parseFloat(input ?? "");
  if (isNaN(num)) {
    return {
      ok: false,
      errors: ["type"]
    };
  }
  const errors = [];
  if (gt !== void 0 && !(num > gt)) {
    errors.push("gt");
  }
  if (min !== void 0 && !(num >= min)) {
    errors.push("min");
  }
  if (lt !== void 0 && !(num < lt)) {
    errors.push("lt");
  }
  if (max !== void 0 && !(num <= max)) {
    errors.push("max");
  }
  if (int !== void 0) {
    const isInt = Number.isInteger(num);
    if (!(int ? isInt : !isInt)) {
      errors.push("int");
    }
  }
  if (errors.length > 0) {
    return {
      ok: false,
      errors
    };
  }
  return {
    ok: true,
    value: num
  };
};
const booleanValidator = (input) => {
  const bool = input === "true" ? true : input === "false" ? false : void 0;
  if (typeof bool !== "boolean") {
    return {
      ok: false,
      errors: ["type"]
    };
  }
  return {
    ok: true,
    value: bool
  };
};
const enumValidator = ({ values }) => (input) => {
  if (!(typeof input === "string" ? values.includes(input) : false)) {
    return {
      ok: false,
      errors: ["type"]
    };
  }
  return {
    ok: true,
    value: input
  };
};
function selectValidator(options) {
  switch (options.type) {
    case "string":
      return stringValidator(options);
    case "number":
      return numberValidator(options);
    case "boolean":
      return booleanValidator;
    case "enum":
      return enumValidator(options);
  }
}
function validateEnvVariable(value, options) {
  const isOptional = options.optional || options.default !== void 0;
  if (isOptional && value === void 0) {
    return {
      ok: true,
      value: options.default
    };
  }
  if (!isOptional && value === void 0) {
    return {
      ok: false,
      errors: ["missing"]
    };
  }
  return selectValidator(options)(value);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-check

// @ts-expect-error
/** @returns {string} */
// used while generating the virtual module
// biome-ignore lint/correctness/noUnusedFunctionParameters: `key` is used by the generated code
// biome-ignore lint/correctness/noUnusedVariables: `key` is used by the generated code
const getEnv = (key) => {
	return getEnv$1(key);
};

const _internalGetSecret = (key) => {
	const rawVariable = getEnv(key);
	const variable = rawVariable === '' ? undefined : rawVariable;
	const options = schema[key];

	const result = validateEnvVariable(variable, options);
	if (result.ok) {
		return result.value;
	}
	const type = getEnvFieldType(options);
	throw createInvalidVariablesError(key, type, result);
};

setOnSetGetEnv(() => {
	WIX_CLIENT_INSTANCE_ID = _internalGetSecret("WIX_CLIENT_INSTANCE_ID");
WIX_CLIENT_PUBLIC_KEY = _internalGetSecret("WIX_CLIENT_PUBLIC_KEY");
WIX_CLIENT_SECRET = _internalGetSecret("WIX_CLIENT_SECRET");

});
let WIX_CLIENT_INSTANCE_ID = _internalGetSecret("WIX_CLIENT_INSTANCE_ID");
let WIX_CLIENT_PUBLIC_KEY = _internalGetSecret("WIX_CLIENT_PUBLIC_KEY");
let WIX_CLIENT_SECRET = _internalGetSecret("WIX_CLIENT_SECRET");

// src/runtime/backend/contextualClient.ts
var authAsyncLocalStorage = new AsyncLocalStorage();
var defaultHost = headlessNode.host({});
var resolveHostForCurrentRequest = () => {
  const store = authAsyncLocalStorage.getStore();
  return store?.sdkHost ?? defaultHost;
};
var hostProxy = new Proxy(
  {},
  {
    get(target, prop) {
      const host = resolveHostForCurrentRequest();
      const value = host[prop];
      if (typeof value !== "function") {
        return value;
      }
      return function(...args) {
        const anotherHost = resolveHostForCurrentRequest();
        return (
          // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
          anotherHost[prop].apply(
            anotherHost,
            args
          )
        );
      };
    }
  }
);

// src/runtime/backend/contextualClient.ts
var authProxy = new Proxy(
  {},
  {
    get(target, prop) {
      const auth = OAuthStrategy({
        clientId: WIX_CLIENT_ID
      });
      const value = auth[prop];
      if (typeof value !== "function") {
        return value;
      }
      return function(...args) {
        const store = authAsyncLocalStorage.getStore();
        if (store?.sessionTokens) {
          auth.setTokens(store.sessionTokens);
        }
        return value.apply(auth, args);
      };
    }
  }
);
var contextualClient = createClient({
  auth: authProxy,
  host: hostProxy
});
var elevatedContextualClient = createClient({
  auth: AppStrategy({
    appId: WIX_CLIENT_ID,
    appSecret: WIX_CLIENT_SECRET,
    instanceId: WIX_CLIENT_INSTANCE_ID,
    publicKey: WIX_CLIENT_PUBLIC_KEY
  }),
  host: hostProxy
});

// src/runtime/backend/setupContextualClient.ts
contextualClient.enableContext("global");
elevatedContextualClient.enableContext("global", { elevated: true });

var auth = OAuthStrategy({
  clientId: WIX_CLIENT_ID
});
async function generateVisitorTokens() {
  return auth.generateVisitorTokens();
}
var tokensSchema = z.object({
  clientId: z.string(),
  tokens: z.object({
    accessToken: z.object({
      expiresAt: z.number(),
      value: z.string()
    }),
    refreshToken: z.object({
      role: z.nativeEnum(TokenRole),
      value: z.string()
    })
  })
});
function getSessionTokensFromCookie(context) {
  if (!context.isPrerendered) {
    const rawCookie = context.cookies.get("wixSession")?.json();
    if (rawCookie != null) {
      const tokensParseResult = tokensSchema.safeParse(rawCookie);
      if (tokensParseResult.success && tokensParseResult.data.clientId === WIX_CLIENT_ID) {
        return tokensParseResult.data.tokens;
      }
    }
  }
  return null;
}

// src/middleware/auth.ts
var onRequest$2 = async (context, next) => {
  const existingTokens = getExistingTokens(context);
  const usedTokens = existingTokens ?? await generateVisitorTokens();
  const store = {
    sdkHost: headlessNode.host({ req: context.request }),
    sessionTokens: usedTokens
  };
  const response = await authAsyncLocalStorage.run(store, async () => {
    return next();
  });
  const contentType = response.headers.get("Content-Type");
  if (contentType !== "text/html") {
    return response;
  }
  if (context.isPrerendered) {
    return response;
  }
  if (existingTokens === usedTokens) {
    return response;
  }
  saveSessionTokensToCookie(context, usedTokens);
  return response;
};
function getExistingTokens(context) {
  const existingTokens = getSessionTokensFromCookie(context);
  if (existingTokens && existingTokens.accessToken.expiresAt + 600 > Date.now() / 1e3) {
    return existingTokens;
  }
  return null;
}

// src/middleware/html-embeds.ts

// src/utils/transformStreamUtils.ts
function injectAfterTransformStream(predicate, htmlToInject) {
  let hasInjected = false;
  return new TransformStream({
    transform: (chunk, controller) => {
      if (!hasInjected) {
        const index = predicate.exec(chunk);
        if (index) {
          const position = index.index + index[0].length;
          chunk = chunk.slice(0, position) + htmlToInject + chunk.slice(position);
          hasInjected = true;
        }
      }
      controller.enqueue(chunk);
    }
  });
}
function injectBeforeTransformStream(predicate, htmlToInject) {
  let hasInjected = false;
  return new TransformStream({
    transform: (chunk, controller) => {
      if (!hasInjected) {
        const index = chunk.indexOf(predicate);
        if (index > -1) {
          chunk = chunk.slice(0, index) + htmlToInject + chunk.slice(index);
          hasInjected = true;
        }
      }
      controller.enqueue(chunk);
    }
  });
}

// src/middleware/html-embeds.ts
var bodyEndTransformStream = (htmlToInject) => injectBeforeTransformStream("</body>", htmlToInject);
var headTransformStream = (htmlToInject) => injectBeforeTransformStream("</head>", htmlToInject);
var bodyStartTransformStream = (htmlToInject) => injectAfterTransformStream(/<body(?![^>]*\/>)[^>]*>/, htmlToInject);
var onRequest$1 = async (context, next) => {
  const response = await next();
  const contentType = response.headers.get("Content-Type");
  if (contentType !== "text/html") {
    return response;
  }
  if (context.url.pathname.startsWith("/_wix")) {
    return response;
  }
  const { siteScripts } = await scripts.listSiteScripts();
  if (siteScripts == null) {
    throw new Error("Could not fetch site scripts");
  }
  const headInjection = siteScripts.filter((x) => x.position === "HEAD").map((x) => x.html).join("\n");
  const bodyStartInjection = siteScripts.filter((x) => x.position === "BODY_START").map((x) => x.html).join("\n");
  const bodyEndInjection = siteScripts.filter((x) => x.position === "BODY_END").map((x) => x.html).join("\n");
  return new Response(
    response.body?.pipeThrough(new TextDecoderStream()).pipeThrough(headTransformStream(headInjection)).pipeThrough(bodyStartTransformStream(bodyStartInjection)).pipeThrough(bodyEndTransformStream(bodyEndInjection)).pipeThrough(new TextEncoderStream()),
    response
  );
};

const onRequest = sequence(
	onRequest$2,
	
	onRequest$1
);

export { onRequest };
