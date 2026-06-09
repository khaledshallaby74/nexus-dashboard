/**
 * Order Domain Models
 * -----------------------------------------------------------------------------------
 * Defines the strict interfaces for order entity structures. 
 * Facilitates consistent data consumption across the application layers.
 */

/** Represents an individual product line item within an order context */
export interface OrderProduct {
  /** Unique product identifier */
  id: number;
  /** Product display title */
  title: string;
  /** Unit price at the time of order */
  price: number;
  /** Count of units purchased */
  quantity: number;
  /** Pre-discount line total */
  total: number;
  /** Applied discount percentage (e.g., 0.15 for 15%) */
  discountPercentage: number;
  /** Final calculated total after applying the discount */
  discountedTotal: number;
  /** Image URL for visual representation */
  thumbnail: string;
}

/** Represents a complete order entity aggregate */
export interface Order {
  /** Unique order identifier */
  id: number;
  /** List of individual product line items */
  products: OrderProduct[];
  /** Sum of all line totals before discounts */
  total: number;
  /** Grand total of the order after all discounts applied */
  discountedTotal: number;
  /** Reference identifier for the ordering user */
  userId: number;
  /** Total count of distinct product types */
  totalProducts: number;
  /** Cumulative count of all items across products */
  totalQuantity: number;
  /** * Operational status lifecycle marker. 
   * Used for business logic filtering and UI state grouping.
   */
  status?: 'pending' | 'shipped' | 'delivered';
}

/** Represents the shape of the paginated API response */
export interface OrdersAPIResponse {
  /** Page list of order entities */
  carts: Order[];
  /** Global total count of records available */
  total: number;
  /** Records skipped for pagination */
  skip: number;
  /** Items returned per page limit */
  limit: number;
}