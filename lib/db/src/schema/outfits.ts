import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const outfitItemSchema = z.object({
  category: z.string(),
  name: z.string(),
  brand: z.string(),
  description: z.string(),
  price: z.number(),
  purchaseUrl: z.string(),
  imageUrl: z.string().optional(),
  color: z.string(),
});

export const outfitLookSchema = z.object({
  id: z.string(),
  title: z.string(),
  vibe: z.string(),
  totalCost: z.number(),
  items: z.array(outfitItemSchema),
  styleNotes: z.string(),
});

export const userSizesSchema = z.object({
  top: z.string().optional(),
  bottom: z.string().optional(),
  shoes: z.string().optional(),
  dress: z.string().optional(),
});

export const savedOutfitsTable = pgTable("saved_outfits", {
  id: serial("id").primaryKey(),
  profileId: text("profile_id"),
  prompt: text("prompt").notNull(),
  look: jsonb("look").notNull(),
  userSizes: jsonb("user_sizes"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const insertSavedOutfitSchema = createInsertSchema(savedOutfitsTable).omit({ id: true, savedAt: true });
export type InsertSavedOutfit = z.infer<typeof insertSavedOutfitSchema>;
export type SavedOutfit = typeof savedOutfitsTable.$inferSelect;
