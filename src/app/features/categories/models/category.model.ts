/**
 * Enterprise Category Domain Models
 * -----------------------------------------------------------------------------------
 * Defines the strict structural contracts for taxonomy entities within the system.
 */

/**
 * Category Domain Entity
 * -----------------------------------------------------------------------------------
 * Represents the processed, application-ready version of a category.
 * Includes both server-provided data and client-side extended UI properties.
 */
export interface Category {
  /** Unique URL-friendly identifier */
  slug: string;
  /** Display label for the taxonomy */
  name: string;
  /** API link reference */
  url: string;
  
  // --- UI Extended Properties ---
  // Computed properties utilized for dynamic dashboard rendering
  
  /** URL for the associated category card/thumbnail image */
  thumbnail?: string;
  /** Denormalized count of products within this category */
  totalProducts?: number;
}

/**
 * Category Data Transfer Object (DTO)
 * -----------------------------------------------------------------------------------
 * Defines the raw structure expected from the remote API payload.
 * Used primarily by the Service Layer for type-safe hydration.
 */
export interface CategoryResponse {
  /** Unique URL-friendly identifier */
  slug: string;
  /** Display label for the taxonomy */
  name: string;
  /** API link reference */
  url: string;
}