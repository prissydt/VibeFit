export interface RawProduct {
  externalId: string;
  source: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  color?: string;
  priceAud: number;
  currency?: string;
  imageUrl: string;
  affiliateUrl: string;
  retailer: string;
  inStock: boolean;
  sizes?: string[];
  description?: string;
  /** Raw tags from the source — tagInferer will enrich these */
  sourceTags?: string[];
}

export interface FetchOptions {
  /** ISO 4217 target currency — adapter should convert if possible */
  targetCurrency?: "AUD";
  /** Max products per fetch (adapter may ignore if API doesn't support) */
  limit?: number;
  /** Pagination cursor returned by previous fetch */
  cursor?: string;
}

export interface FetchResult {
  products: RawProduct[];
  /** Pass back to next call for pagination; undefined = no more pages */
  nextCursor?: string;
}

/**
 * All catalog sources implement this interface.
 * One adapter per retailer / affiliate network.
 */
export interface CatalogAdapter {
  /** Stable identifier used in products.source column */
  readonly sourceId: string;

  /**
   * Pull a page of products from the source.
   * Implementations should be idempotent — safe to call repeatedly.
   */
  fetchProducts(options?: FetchOptions): Promise<FetchResult>;

  /**
   * Verify whether a single product is still in stock.
   * Used by stockChecker.ts for periodic verification.
   * Return null if the adapter cannot check individual items.
   */
  checkStock(externalId: string): Promise<boolean | null>;
}
