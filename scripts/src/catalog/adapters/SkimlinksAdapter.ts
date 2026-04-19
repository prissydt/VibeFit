import type { CatalogAdapter, FetchOptions, FetchResult, RawProduct } from "../CatalogAdapter.js";

/**
 * Skimlinks Content API adapter.
 * Gives access to 48,500+ merchants including Witchery, Country Road, ASOS, Zara AU.
 *
 * Credentials needed (set in .env):
 *   SKIMLINKS_ACCOUNT_ID  — your publisher account ID
 *   SKIMLINKS_API_KEY     — Content API key (different from JS API key)
 *
 * Apply at: https://skimlinks.com/join/  →  Content API tab
 * Docs: https://api.skimlinks.com/
 */
export class SkimlinksAdapter implements CatalogAdapter {
  readonly sourceId = "skimlinks";

  private readonly accountId: string;
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.skimlinks.com";

  constructor() {
    this.accountId = process.env["SKIMLINKS_ACCOUNT_ID"] ?? "";
    this.apiKey    = process.env["SKIMLINKS_API_KEY"]    ?? "";

    if (!this.accountId || !this.apiKey) {
      throw new Error(
        "SkimlinksAdapter: SKIMLINKS_ACCOUNT_ID and SKIMLINKS_API_KEY are required",
      );
    }
  }

  async fetchProducts(options?: FetchOptions): Promise<FetchResult> {
    // TODO: implement Skimlinks Content API product search
    //
    // Rough steps:
    //   1. GET /products?
    //        account_id={this.accountId}
    //        &api_key={this.apiKey}
    //        &category=women-fashion       (Skimlinks taxonomy category slug)
    //        &country=AU
    //        &currency=AUD
    //        &limit={options?.limit ?? 100}
    //        &page={parsedCursor}
    //
    //   2. Map each product in response.products to RawProduct:
    //        externalId  → product.id
    //        title       → product.name
    //        brand       → product.brand
    //        priceAud    → product.price (already AUD if currency=AUD)
    //        imageUrl    → product.image_url
    //        affiliateUrl→ product.url  (Skimlinks auto-affiliates on click, or use /convert endpoint)
    //        retailer    → product.merchant_name
    //        inStock     → product.availability === "in stock"
    //        sizes       → product.sizes (array if present)
    //        sourceTags  → product.categories (Skimlinks taxonomy strings)
    //
    //   3. Return nextCursor from response.pagination.next_page

    void options;
    throw new Error("TODO: SkimlinksAdapter.fetchProducts — credentials pending approval");
  }

  async checkStock(externalId: string): Promise<boolean | null> {
    // TODO: implement single-product stock check
    //
    //   GET /products/{externalId}?account_id=...&api_key=...
    //   Return product.availability === "in stock"
    //
    // Note: Skimlinks may rate-limit individual lookups — consider batching
    // via POST /products/availability with array of IDs if supported.

    void externalId;
    return null; // stub
  }
}
