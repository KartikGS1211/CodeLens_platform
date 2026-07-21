// Wix CMS CRUD service — stubbed for non-Wix deployments (e.g. Vercel)
// Originally used @wix/data SDK which is not available outside Wix hosting

import { WixDataItem, WixDataQueryResult } from "./types";

/**
 * Stub CRUD Service for non-Wix environments.
 * All methods throw a clear error in non-Wix environments.
 */
export class BaseCrudService {
  static async create<T extends WixDataItem>(
    collectionId: string,
    _itemData: Partial<T> | Record<string, unknown>,
    _multiReferences?: Record<string, unknown>,
  ): Promise<T> {
    throw new Error(
      `BaseCrudService.create: Wix Data SDK not available in this environment (collection: ${collectionId})`,
    );
  }

  static async getAll<T extends WixDataItem>(
    collectionId: string,
    _includeReferencedItems?: string[],
  ): Promise<WixDataQueryResult<T>> {
    throw new Error(
      `BaseCrudService.getAll: Wix Data SDK not available in this environment (collection: ${collectionId})`,
    );
  }

  static async getById<T extends WixDataItem>(
    collectionId: string,
    _itemId: string,
    _includeReferencedItems?: string[],
  ): Promise<T | null> {
    throw new Error(
      `BaseCrudService.getById: Wix Data SDK not available in this environment (collection: ${collectionId})`,
    );
  }

  static async update<T extends WixDataItem>(
    collectionId: string,
    _itemData: T,
  ): Promise<T> {
    throw new Error(
      `BaseCrudService.update: Wix Data SDK not available in this environment (collection: ${collectionId})`,
    );
  }

  static async delete<T extends WixDataItem>(
    collectionId: string,
    _itemId: string,
  ): Promise<T> {
    throw new Error(
      `BaseCrudService.delete: Wix Data SDK not available in this environment (collection: ${collectionId})`,
    );
  }
}
