/**
 * Auto-generated entity types
 * Contains all CMS collection interfaces in a single file 
 */

/**
 * Collection ID: architecturebestpractices
 * Interface for ArchitectureBestPractices
 */
export interface ArchitectureBestPractices {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  title?: string;
  /** @wixFieldType text */
  category?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  examples?: string;
  /** @wixFieldType text */
  complianceGuidelines?: string;
  /** @wixFieldType image */
  diagram?: string;
}


/**
 * Collection ID: repositories
 * Interface for Repositories
 */
export interface Repositories {
  analysisId: any;
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  /** @wixFieldType text */
  repositoryName?: string;
  /** @wixFieldType text */
  status?: string;
  /** @wixFieldType url */
  repositoryUrl?: string;
  /** @wixFieldType text */
  description?: string;
  /** @wixFieldType text */
  owner?: string;
  /** @wixFieldType datetime */
  lastSyncDate?: Date | string;
}
