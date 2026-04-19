import type { CatalogAdapter, FetchOptions, FetchResult, RawProduct } from "../CatalogAdapter.js";

/**
 * Amazon Product Advertising API 5.0 adapter.
 *
 * Credentials needed (set in .env):
 *   AMAZON_ACCESS_KEY     — PA-API access key
 *   AMAZON_SECRET_KEY     — PA-API secret key
 *   AMAZON_PARTNER_TAG    — Associates tracking ID (e.g. vibefit-22)
 *   AMAZON_MARKETPLACE    — Marketplace host (default: www.amazon.com.au)
 *
 * Apply at: https://affiliate-program.amazon.com.au/
 */
export class AmazonAdapter implements CatalogAdapter {
  readonly sourceId = "amazon";

  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly partnerTag: string;
  private readonly marketplace: string;

  constructor() {
    this.accessKey   = process.env["AMAZON_ACCESS_KEY"]   ?? "";
    this.secretKey   = process.env["AMAZON_SECRET_KEY"]   ?? "";
    this.partnerTag  = process.env["AMAZON_PARTNER_TAG"]  ?? "";
    this.marketplace = process.env["AMAZON_MARKETPLACE"]  ?? "www.amazon.com.au";

    if (!this.accessKey || !this.secretKey || !this.partnerTag) {
      throw new Error(
        "AmazonAdapter: AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY and AMAZON_PARTNER_TAG are required",
      );
    }
  }

  async fetchProducts(_options?: FetchOptions): Promise<FetchResult> {
    // TODO: implement PA-API 5.0 SearchItems call
    //
    // Rough steps:
    //   1. Build SearchItems request for BrowseNodeId 7141123011 (Women's Fashion AU)
    //   2. Sign with AWS Signature V4 using this.accessKey / this.secretKey
    //   3. POST to https://{this.marketplace}/paapi5/searchitems
    //   4. Map each Item in the response to RawProduct:
    //        externalId  → item.ASIN
    //        title       → item.ItemInfo.Title.DisplayValue
    //        brand       → item.ItemInfo.ByLineInfo.Brand.DisplayValue
    //        priceAud    → item.Offers.Listings[0].Price.Amount
    //        imageUrl    → item.Images.Primary.Large.URL
    //        affiliateUrl→ item.DetailPageURL  (contains partnerTag already)
    //        inStock     → item.Offers.Listings[0].Availability.Type === "Now"
    //   5. Handle pagination via _options.cursor → SearchIndex offset
    //
    // Useful library: aws4 (sign requests) or amazon-paapi npm package

    throw new Error("TODO: AmazonAdapter.fetchProducts — credentials pending approval");
  }

  async checkStock(externalId: string): Promise<boolean | null> {
    // TODO: implement PA-API 5.0 GetItems call for a single ASIN
    //
    //   POST /paapi5/getitems with ItemIds: [externalId], Resources: ["Offers.Listings.Availability"]
    //   Return item.Offers.Listings[0].Availability.Type === "Now"

    void externalId;
    return null; // stub — stock unchanged until implemented
  }
}
