import { createRESTModule } from '@wix/sdk-runtime/rest-modules';

// src/elevate.ts
function elevate(restModule) {
  return createRESTModule(restModule, true);
}

export { elevate as e };
