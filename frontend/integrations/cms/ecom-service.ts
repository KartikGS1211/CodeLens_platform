// Wix eCommerce service — stubbed for non-Wix deployments (e.g. Vercel)
// Originally used @wix/ecom, @wix/redirects, @wix/services-manager-react
// which are only available inside Wix's hosting environment

/**
 * Stub: Direct purchase (not available outside Wix)
 */
export async function buyNow(
  _items: Array<{ collectionId: string; itemId: string; quantity?: number }>,
): Promise<void> {
  throw new Error(
    "buyNow: Wix eCommerce SDK is not available in this environment.",
  );
}

/**
 * Stub: eCommerce hook (not available outside Wix)
 */
export function useEcomService() {
  return {
    isCartAvailable: false,
    addToCart: async () => {
      throw new Error(
        "useEcomService.addToCart: Wix Cart SDK is not available in this environment.",
      );
    },
    checkout: async () => {
      throw new Error(
        "useEcomService.checkout: Wix Cart SDK is not available in this environment.",
      );
    },
  };
}
