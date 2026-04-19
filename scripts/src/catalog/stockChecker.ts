import type { CatalogAdapter } from "./CatalogAdapter.js";

export interface StockCheckResult {
  externalId: string;
  source: string;
  inStock: boolean | null;
  checkedAt: Date;
  error?: string;
}

/**
 * Verifies stock status for a batch of products using their registered adapter.
 * Products whose adapter returns null are skipped (stock unchanged in DB).
 *
 * @param products  Rows from the products table (need externalId + source)
 * @param adapters  Map of sourceId → adapter instance
 * @param onResult  Callback fired after each individual check (for progress logging)
 */
export async function checkStockBatch(
  products: Array<{ externalId: string; source: string }>,
  adapters: Map<string, CatalogAdapter>,
  onResult?: (result: StockCheckResult) => void,
): Promise<StockCheckResult[]> {
  const results: StockCheckResult[] = [];

  for (const product of products) {
    const adapter = adapters.get(product.source);

    if (!adapter) {
      // No adapter registered for this source — skip silently
      continue;
    }

    let inStock: boolean | null = null;
    let error: string | undefined;

    try {
      inStock = await adapter.checkStock(product.externalId);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }

    const result: StockCheckResult = {
      externalId: product.externalId,
      source: product.source,
      inStock,
      checkedAt: new Date(),
      ...(error ? { error } : {}),
    };

    results.push(result);
    onResult?.(result);

    // Polite delay between checks to avoid hammering APIs
    await sleep(200);
  }

  return results;
}

/**
 * Applies stock check results back to the DB.
 * Call this after checkStockBatch() with the returned results.
 */
export async function applyStockResults(
  results: StockCheckResult[],
  db: Awaited<ReturnType<typeof import("@workspace/db")["db"]["select"]>> extends never
    ? never
    : import("@workspace/db")["db"],
  productsTable: typeof import("@workspace/db")["productsTable"],
): Promise<{ updated: number; skipped: number }> {
  const { eq, and } = await import("drizzle-orm");

  let updated = 0;
  let skipped = 0;

  for (const result of results) {
    if (result.inStock === null || result.error) {
      skipped++;
      continue;
    }

    await (db as any)
      .update(productsTable)
      .set({ inStock: result.inStock, lastVerifiedAt: result.checkedAt })
      .where(
        and(
          eq(productsTable.externalId, result.externalId),
          eq(productsTable.source, result.source),
        ),
      );

    updated++;
  }

  return { updated, skipped };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
