import { pgTable, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProfilesTable = pgTable("user_profiles", {
  profileId: text("profile_id").primaryKey(),
  name: text("name"),
  gender: text("gender"),
  age: integer("age"),
  skinTone: text("skin_tone"),
  location: text("location"),
  sizes: jsonb("sizes"),
  stylePreferences: jsonb("style_preferences").$type<string[]>().default([]),
  avoidKeywords: jsonb("avoid_keywords").$type<string[]>().default([]),
  likedLookIds: jsonb("liked_look_ids").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable);
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfilesTable.$inferSelect;
