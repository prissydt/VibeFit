import { db, productsTable, outfitTemplatesTable } from "@workspace/db";
import type { TemplateSlot } from "@workspace/db";
import { eq, and, lte, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export interface AssembleRequest {
  prompt: string;
  numLooks?: number;
  maxBudget?: number;
  gender?: string;
  preferredColors?: string[];
  avoidKeywords?: string[];
  location?: string;
}

export interface AssembledLookItem {
  category: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  purchaseUrl: string;
  imageUrl: string;
  color: string;
  productId: number;
}

export interface AssembledLook {
  id: string;
  title: string;
  vibe: string;
  styleNotes: string;
  totalCost: number;
  items: AssembledLookItem[];
}

// ---- Prompt parsing ----

const OCCASION_WORDS = ["date", "wedding", "work", "brunch", "party", "interview", "casual", "formal", "gym"];
const SEASON_WORDS: [string, string[]][] = [
  ["spring",  ["spring"]],
  ["summer",  ["summer", "warm", "hot"]],
  ["autumn",  ["autumn", "fall", "cool"]],
  ["winter",  ["winter", "cold"]],
];
const COLOR_WORDS = ["black", "white", "red", "blue", "navy", "green", "pink", "neutral", "beige", "burgundy", "brown", "grey", "gray", "cream", "camel"];
const STYLE_WORDS = ["minimal", "edgy", "romantic", "casual", "elegant", "streetwear", "boho", "classic", "preppy"];

function currentSeason(): string {
  const month = new Date().getMonth();
  // Southern hemisphere (AU)
  if (month >= 2 && month <= 4) return "autumn";
  if (month >= 5 && month <= 7) return "winter";
  if (month >= 8 && month <= 10) return "spring";
  return "summer";
}

function parsePrompt(prompt: string) {
  const lower = prompt.toLowerCase();

  const occasions = OCCASION_WORDS.filter(w => lower.includes(w));
  const seasons: string[] = [];
  for (const [season, keywords] of SEASON_WORDS) {
    if (keywords.some(k => lower.includes(k))) seasons.push(season);
  }
  const colors = COLOR_WORDS.filter(w => lower.includes(w));
  const styles = STYLE_WORDS.filter(w => lower.includes(w));

  if (!occasions.length) occasions.push("casual");
  if (!seasons.length) seasons.push(currentSeason());

  return { occasions, seasons, colors, styles };
}

function budgetTierFromAmount(maxBudget: number | undefined): string | null {
  if (!maxBudget) return null;
  if (maxBudget <= 50)   return "budget";
  if (maxBudget <= 100)  return "high-street";
  if (maxBudget <= 250)  return "mid-range";
  if (maxBudget <= 500)  return "premium";
  return "luxury";
}

function slotBudgetCap(category: string, totalBudget: number): number {
  const proportions: Record<string, number> = {
    Dress:       0.35,
    Top:         0.20,
    Bottom:      0.20,
    Shoes:       0.25,
    Bag:         0.20,
    Outerwear:   0.30,
    Jewelry:     0.10,
    Accessories: 0.10,
    Makeup:      0.05,
    Hair:        0.05,
  };
  return totalBudget * (proportions[category] ?? 0.15);
}

// Builds a parameterized ARRAY[...] && column expression
function pgArrayOverlaps(column: unknown, values: string[]) {
  if (!values.length) return sql`true`;
  return sql`${column as Parameters<typeof sql>[0]} && ARRAY[${sql.join(values.map(v => sql`${v}`), sql`, `)}]::text[]`;
}

function mapProductToItem(product: typeof productsTable.$inferSelect): AssembledLookItem {
  return {
    category: product.category,
    name: product.title,
    brand: product.brand,
    description: product.description ?? "",
    price: product.priceAud,
    purchaseUrl: product.affiliateUrl,
    imageUrl: product.imageUrl,
    color: product.color ?? "",
    productId: product.id,
  };
}

// ---- Core assembler ----

export async function assembleOutfits(req: AssembleRequest): Promise<AssembledLook[]> {
  const { prompt, numLooks = 4, maxBudget, gender = "woman", preferredColors = [], avoidKeywords = [] } = req;
  const parsed = parsePrompt(prompt);
  const budgetTier = budgetTierFromAmount(maxBudget);
  const effectiveGender = gender === "woman" || !gender ? "woman" : gender;

  // Find matching outfit templates
  const templateWhere = and(
    pgArrayOverlaps(outfitTemplatesTable.occasions, parsed.occasions),
    eq(outfitTemplatesTable.isActive, true),
    eq(outfitTemplatesTable.gender, effectiveGender),
    ...(budgetTier ? [eq(outfitTemplatesTable.budgetTier, budgetTier)] : []),
  );

  let templates = await db
    .select()
    .from(outfitTemplatesTable)
    .where(templateWhere)
    .limit(numLooks * 3);

  // Fallback: any active templates for this gender/budget
  if (!templates.length) {
    templates = await db
      .select()
      .from(outfitTemplatesTable)
      .where(
        and(
          eq(outfitTemplatesTable.isActive, true),
          eq(outfitTemplatesTable.gender, effectiveGender),
          ...(budgetTier ? [eq(outfitTemplatesTable.budgetTier, budgetTier)] : []),
        ),
      )
      .limit(numLooks * 2);
  }

  // Final fallback: anything active
  if (!templates.length) {
    templates = await db
      .select()
      .from(outfitTemplatesTable)
      .where(eq(outfitTemplatesTable.isActive, true))
      .limit(numLooks * 2);
  }

  // Shuffle for variety
  templates.sort(() => Math.random() - 0.5);

  const allColors = [...preferredColors, ...parsed.colors];
  const looks: AssembledLook[] = [];

  for (const template of templates) {
    if (looks.length >= numLooks) break;

    const slots = template.slots as TemplateSlot[];
    const items: AssembledLookItem[] = [];
    let failedRequired = false;
    let totalCost = 0;

    for (const slot of slots) {
      const budgetCap = maxBudget ? slotBudgetCap(slot.category, maxBudget) : undefined;

      const conditions = [
        eq(productsTable.category, slot.category),
        eq(productsTable.inStock, true),
        ...(slot.tags?.length ? [pgArrayOverlaps(productsTable.tags, slot.tags)] : []),
        ...(budgetCap ? [lte(productsTable.priceAud, budgetCap)] : []),
        ...(avoidKeywords.length
          ? [sql`NOT (${productsTable.tags} && ARRAY[${sql.join(avoidKeywords.map(k => sql`${k}`), sql`, `)}]::text[])`]
          : []),
      ];

      // Build query; order color-matched products first
      const baseQuery = db.select().from(productsTable).where(and(...conditions));
      const candidates = await (allColors.length
        ? baseQuery.orderBy(
            sql`CASE WHEN ${productsTable.color} = ANY(ARRAY[${sql.join(allColors.map(c => sql`${c}`), sql`, `)}]::text[]) THEN 0 ELSE 1 END`,
          )
        : baseQuery
      ).limit(10);

      if (!candidates.length) {
        // Fallback: same category, any tags
        const fallback = await db
          .select()
          .from(productsTable)
          .where(and(eq(productsTable.category, slot.category), eq(productsTable.inStock, true)))
          .limit(10);

        if (!fallback.length) {
          if (slot.required) { failedRequired = true; break; }
          continue;
        }

        const pick = fallback[Math.floor(Math.random() * fallback.length)];
        items.push(mapProductToItem(pick));
        totalCost += pick.priceAud;
        continue;
      }

      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      items.push(mapProductToItem(pick));
      totalCost += pick.priceAud;
    }

    if (failedRequired) continue;

    const vibeWords = (template.vibeKeywords ?? []).slice(0, 3).join(", ");
    const occasions = (template.occasions ?? []).join(" or ");

    looks.push({
      id: `look-${looks.length + 1}`,
      title: template.title,
      vibe: vibeWords,
      styleNotes: `A ${vibeWords} look perfect for ${occasions}. Colors: ${(template.colorPalette ?? []).join(", ")}.`,
      totalCost: Math.round(totalCost * 100) / 100,
      items,
    });
  }

  return looks;
}
