import {
  pgTable,
  serial,
  text,
  real,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  customType,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// pgvector custom type — requires `CREATE EXTENSION IF NOT EXISTS vector` on the DB
const pgVector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 512})`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
});

export const productsTable = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    externalId: text("external_id").unique(),
    source: text("source"),
    title: text("title").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    subcategory: text("subcategory"),
    color: text("color"),
    priceAud: real("price_aud").notNull(),
    currency: text("currency").default("AUD"),
    imageUrl: text("image_url").notNull(),
    affiliateUrl: text("affiliate_url").notNull(),
    retailer: text("retailer").notNull(),
    inStock: boolean("in_stock").default(true),
    sizes: jsonb("sizes").$type<string[]>(),
    tags: text("tags").array(),
    description: text("description"),
    embedding: pgVector("embedding", { dimensions: 512 }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("products_category_idx").on(table.category),
    index("products_brand_idx").on(table.brand),
    index("products_color_idx").on(table.color),
    index("products_price_idx").on(table.priceAud),
    index("products_in_stock_idx").on(table.inStock),
    index("products_tags_idx").on(table.tags),
  ],
);

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
