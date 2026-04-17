import { Router, type IRouter } from "express";
import { db, savedOutfitsTable, outfitLookSchema, userSizesSchema } from "@workspace/db";
import {
  GenerateOutfitsBody,
  GenerateModelImageBody,
  SaveOutfitBody,
  GetSavedOutfitParams,
  DeleteSavedOutfitParams,
} from "@workspace/api-zod";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { eq } from "drizzle-orm";
import { generateLimiter, modelImageLimiter, rateLimit } from "../lib/rateLimit";
import { assembleOutfits } from "../lib/outfitAssembler";

const router: IRouter = Router();

type ItemWithCategory = { category: string; price?: number };
type LookItem = { category: string; name: string; brand: string; color: string; description: string; price?: number };
type LookShape = { id: string; title: string; vibe: string; items: LookItem[]; totalCost: number };

const SKIN_TONE_DESCRIPTIONS: Record<string, string> = {
  fair:   "very fair, pale caucasian",
  light:  "light, warm ivory",
  medium: "medium, warm beige",
  olive:  "olive, light brown mediterranean",
  tan:    "tan, medium brown",
  deep:   "deep brown",
  rich:   "very deep, rich dark brown",
};

function buildImagePrompt(
  look: LookShape,
  opts: { gender?: string; skinTone?: string; topSize?: string }
): string {
  const clothingItems = look.items
    .filter(i => !["Hair", "Makeup"].includes(i.category))
    .map(i => `${i.color} ${i.name} (${i.category}) by ${i.brand}`)
    .join(", ");
  const hairDesc = look.items.find(i => i.category === "Hair")?.description ?? "natural styled hair";
  const makeupItem = look.items.find(i => i.category === "Makeup");
  const makeupDesc = makeupItem ? `${makeupItem.name} — ${makeupItem.description}` : "natural makeup";
  const isMale = opts.gender === "man";
  const genderCtx = isMale ? "male" : "female";
  const pronoun = isMale ? "He" : "She";
  const skinDesc = opts.skinTone ? SKIN_TONE_DESCRIPTIONS[opts.skinTone] ?? opts.skinTone : "medium beige";
  const sizeCtx = opts.topSize ? `, size ${opts.topSize}` : "";
  const shoeItem = look.items.find(i => i.category === "Shoes");
  const shoeEmphasis = shoeItem
    ? ` SHOES: ${shoeItem.color} ${shoeItem.name} by ${shoeItem.brand} are clearly visible on both feet at the bottom of the frame.`
    : "";
  return `High-end fashion editorial photograph on a pure light grey studio backdrop. The ${genderCtx} model has ${skinDesc} skin${sizeCtx}. CRITICAL FRAMING RULE: This is a full-body portrait — the model's complete body from the very top of the head down to the bottom of the shoes must be fully visible, nothing cropped. Leave space above the head and below the feet.${shoeEmphasis} ${pronoun} is wearing: ${clothingItems}. Hair: ${hairDesc}. Makeup: ${makeupDesc}. Aesthetic: ${look.vibe}. Shot on Phase One medium format, 80mm lens, softbox lighting, sharp full-body focus. IMPORTANT: skin tone is ${skinDesc} — render accurately, do not alter.`;
}

function getHotspotsForLook(items: ItemWithCategory[]) {
  const REGION_MAP: Record<string, { xPct: number; yPct: number }> = {
    "Hair":        { xPct: 50, yPct: 6  },
    "Makeup":      { xPct: 53, yPct: 13 },
    "Jewelry":     { xPct: 50, yPct: 22 },
    "Accessories": { xPct: 80, yPct: 28 },
    "Top":         { xPct: 50, yPct: 33 },
    "Dress":       { xPct: 50, yPct: 48 },
    "Bag":         { xPct: 80, yPct: 53 },
    "Bottom":      { xPct: 50, yPct: 60 },
    "Shoes":       { xPct: 50, yPct: 88 },
  };

  return items.map((item, itemIndex) => {
    const pos = REGION_MAP[item.category] ?? { xPct: 50, yPct: 50 };
    return { itemIndex, category: item.category, ...pos };
  });
}

// POST /outfits/generate
router.post("/generate", rateLimit(generateLimiter), async (req, res) => {
  try {
    const body = GenerateOutfitsBody.parse(req.body);
    const numLooks = body.numLooks ?? 4;
    const maxBudget = body.maxBudget as number | undefined;
    const userSizes = body.userSizes as { top?: string; bottom?: string; shoes?: string; dress?: string } | undefined;
    const profile = body.userProfile as {
      gender?: string; age?: number; skinTone?: string; location?: string;
      stylePreferences?: string[]; avoidKeywords?: string[]; likedLookIds?: string[];
      sizes?: { top?: string; bottom?: string; shoes?: string; dress?: string };
    } | undefined;

    const effectiveSizes = userSizes ?? profile?.sizes;

    const looks = await assembleOutfits({
      prompt: body.prompt,
      numLooks,
      maxBudget,
      gender: profile?.gender,
      preferredColors: profile?.stylePreferences?.filter(p => p.startsWith("color:")).map(p => p.slice(6)) ?? [],
      avoidKeywords: profile?.avoidKeywords ?? [],
      location: profile?.location,
    });

    res.json({
      prompt: body.prompt,
      looks,
      userSizes: effectiveSizes ?? null,
      maxBudget: maxBudget ?? null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate outfits");
    res.status(500).json({ error: "Failed to generate outfits" });
  }
});

// POST /outfits/model-image
router.post("/model-image", rateLimit(modelImageLimiter), async (req, res) => {
  try {
    const body = GenerateModelImageBody.parse(req.body);
    const look = body.look as {
      id: string;
      title: string;
      vibe: string;
      items: Array<{ category: string; name: string; brand: string; color: string; description: string }>;
    };
    const userSizes = body.userSizes as { top?: string; bottom?: string; shoes?: string; dress?: string } | undefined;
    const profile = body.userProfile as {
      gender?: string; age?: number; skinTone?: string;
    } | undefined;

    const imagePrompt = buildImagePrompt(look as unknown as LookShape, {
      gender: profile?.gender,
      skinTone: profile?.skinTone,
      topSize: userSizes?.top,
    });

    const imageBuffer = await generateImageBuffer(imagePrompt, "1024x1536");
    const b64 = imageBuffer.toString("base64");
    const hotspots = getHotspotsForLook(look.items);

    res.json({ lookId: look.id, modelImageB64: b64, hotspots });
  } catch (err) {
    req.log.error({ err }, "Failed to generate model image");
    res.status(500).json({ error: "Failed to generate model image" });
  }
});

// GET /outfits/saved
router.get("/saved", async (req, res) => {
  try {
    const outfits = await db
      .select()
      .from(savedOutfitsTable)
      .where(eq(savedOutfitsTable.profileId, req.deviceId))
      .orderBy(savedOutfitsTable.savedAt);
    res.json({ outfits: outfits.reverse() });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch saved outfits");
    res.status(500).json({ error: "Failed to fetch saved outfits" });
  }
});

// GET /outfits/saved/:id
router.get("/saved/:id", async (req, res) => {
  try {
    const { id } = GetSavedOutfitParams.parse(req.params);
    const [outfit] = await db.select().from(savedOutfitsTable).where(eq(savedOutfitsTable.id, id));
    if (!outfit) {
      res.status(404).json({ error: "Outfit not found" });
      return;
    }
    if (outfit.profileId !== req.deviceId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json(outfit);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch saved outfit");
    res.status(500).json({ error: "Failed to fetch saved outfit" });
  }
});

// DELETE /outfits/saved/:id
router.delete("/saved/:id", async (req, res) => {
  try {
    const { id } = DeleteSavedOutfitParams.parse(req.params);
    const [outfit] = await db.select().from(savedOutfitsTable).where(eq(savedOutfitsTable.id, id));
    if (!outfit) {
      res.status(404).json({ error: "Outfit not found" });
      return;
    }
    if (outfit.profileId !== req.deviceId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    await db.delete(savedOutfitsTable).where(eq(savedOutfitsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete saved outfit");
    res.status(500).json({ error: "Failed to delete outfit" });
  }
});

// POST /outfits/save
router.post("/save", async (req, res) => {
  try {
    const body = SaveOutfitBody.parse(req.body);
    const look = outfitLookSchema.parse(body.look);
    const userSizes = body.userSizes ? userSizesSchema.parse(body.userSizes) : null;

    const [saved] = await db
      .insert(savedOutfitsTable)
      .values({
        profileId: req.deviceId,
        prompt: body.prompt,
        look: look as object,
        userSizes: userSizes as object,
      })
      .returning();

    res.json(saved);
  } catch (err) {
    req.log.error({ err }, "Failed to save outfit");
    res.status(500).json({ error: "Failed to save outfit" });
  }
});

export default router;
