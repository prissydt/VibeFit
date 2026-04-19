import { config } from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env") });

// Dynamic imports so dotenv runs before any module reads process.env
const { db, productsTable } = await import("@workspace/db");
import type { InsertProduct } from "@workspace/db";
import { eq, and } from "drizzle-orm";

import { inferTags } from "./tagInferer.js";
import type { CatalogAdapter, FetchOptions } from "./CatalogAdapter.js";

// ---- Register adapters here as credentials become available ----
//
// import { AmazonAdapter }    from "./adapters/AmazonAdapter.js";
// import { SkimlinksAdapter } from "./adapters/SkimlinksAdapter.js";
//
// const ADAPTERS: CatalogAdapter[] = [
//   new AmazonAdapter(),
//   new SkimlinksAdapter(),
// ];

const ADAPTERS: CatalogAdapter[] = [
  // empty until credentials are approved
];

// ---- Config ----

const MAX_PAGES_PER_ADAPTER = 10;
const PAGE_SIZE = 100;

// ---- Runner ----

async function ingest() {
  if (ADAPTERS.length === 0) {
    console.log("No adapters registered — nothing to ingest.");
    console.log("Uncomment adapters in ingest.ts once credentials are ready.");
    process.exit(0);
  }

  let totalInserted = 0;
  let totalUpdated  = 0;
  let totalSkipped  = 0;

  for (const adapter of ADAPTERS) {
    console.log(`\n── Ingesting from ${adapter.sourceId} ──`);

    let cursor: string | undefined;
    let page = 0;

    while (page < MAX_PAGES_PER_ADAPTER) {
      const options: FetchOptions = { limit: PAGE_SIZE, cursor, targetCurrency: "AUD" };
      let result;

      try {
        result = await adapter.fetchProducts(options);
      } catch (err) {
        console.error(`  [${adapter.sourceId}] page ${page + 1} failed:`, err);
        break;
      }

      console.log(`  page ${page + 1}: ${result.products.length} products`);

      for (const raw of result.products) {
        const tags = inferTags({
          category:    raw.category,
          subcategory: raw.subcategory,
          color:       raw.color,
          title:       raw.title,
          description: raw.description,
          sourceTags:  raw.sourceTags,
        });

        const row: InsertProduct = {
          externalId:  raw.externalId,
          source:      raw.source,
          title:       raw.title,
          brand:       raw.brand,
          category:    raw.category,
          subcategory: raw.subcategory,
          color:       raw.color,
          priceAud:    raw.priceAud,
          currency:    raw.currency ?? "AUD",
          imageUrl:    raw.imageUrl,
          affiliateUrl: raw.affiliateUrl,
          retailer:    raw.retailer,
          inStock:     raw.inStock,
          sizes:       raw.sizes,
          description: raw.description,
          tags,
          lastVerifiedAt: new Date(),
        };

        const existing = await db
          .select({ id: productsTable.id })
          .from(productsTable)
          .where(
            and(
              eq(productsTable.externalId, raw.externalId),
              eq(productsTable.source, raw.source),
            ),
          )
          .limit(1);

        if (existing.length) {
          // Update price, stock, tags — keep embedding if already set
          await db
            .update(productsTable)
            .set({
              priceAud:      row.priceAud,
              inStock:       row.inStock,
              tags,
              imageUrl:      row.imageUrl,
              affiliateUrl:  row.affiliateUrl,
              lastVerifiedAt: row.lastVerifiedAt,
              updatedAt:     new Date(),
            })
            .where(eq(productsTable.id, existing[0]!.id));
          totalUpdated++;
        } else {
          await db.insert(productsTable).values(row);
          totalInserted++;
        }
      }

      if (!result.nextCursor || result.products.length < PAGE_SIZE) break;
      cursor = result.nextCursor;
      page++;
    }
  }

  console.log(`\nDone. inserted=${totalInserted} updated=${totalUpdated} skipped=${totalSkipped}`);
}

ingest().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
