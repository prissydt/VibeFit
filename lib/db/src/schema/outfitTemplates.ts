import {
  pgTable,
  serial,
  text,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type TemplateSlot = {
  category: string;
  tags: string[];
  required: boolean;
};

export const outfitTemplatesTable = pgTable("outfit_templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  occasions: text("occasions").array().notNull(),
  seasons: text("seasons").array().notNull(),
  vibeKeywords: text("vibe_keywords").array().notNull(),
  colorPalette: text("color_palette").array().notNull(),
  budgetTier: text("budget_tier").notNull(),
  gender: text("gender").default("woman"),
  slots: jsonb("slots").$type<TemplateSlot[]>().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertOutfitTemplateSchema = createInsertSchema(outfitTemplatesTable).omit({ id: true });
export type InsertOutfitTemplate = z.infer<typeof insertOutfitTemplateSchema>;
export type OutfitTemplate = typeof outfitTemplatesTable.$inferSelect;
