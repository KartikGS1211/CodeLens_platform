// Wix Data SDK types — stubbed for non-Wix deployments (e.g. Vercel)
// These were originally imported from "@wix/data" which is not available outside Wix

export type WixDataItem = {
  _id?: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  [key: string]: unknown;
};

export type WixDataQueryResult<T = WixDataItem> = {
  items: T[];
  totalCount: number;
  hasNext(): boolean;
  hasPrev(): boolean;
};
