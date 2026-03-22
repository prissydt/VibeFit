import { Router, type IRouter } from "express";
import { db, savedOutfitsTable, outfitLookSchema, userSizesSchema } from "@workspace/db";
import {
  GenerateOutfitsBody,
  GenerateModelImageBody,
  SaveOutfitBody,
  GetSavedOutfitParams,
  DeleteSavedOutfitParams,
  GetSavedOutfitsQueryParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

type ItemWithCategory = { category: string; price?: number };
type LookItem = { category: string; name: string; brand: string; color: string; description: string; price?: number };
type LookShape = { id: string; title: string; vibe: string; items: LookItem[]; totalCost: number };

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
  const genderCtx = opts.gender === "man" ? "male" : "female";
  const skinCtx = opts.skinTone ? `with ${opts.skinTone} skin tone` : "";
  const sizeCtx = opts.topSize ? `wearing size ${opts.topSize}` : "";
  return `Professional fashion editorial photograph. Full-length shot of a ${genderCtx} model ${skinCtx} ${sizeCtx} standing against a clean minimal studio backdrop (soft grey). She is wearing: ${clothingItems}. Her hair is styled: ${hairDesc}. Full makeup: ${makeupDesc}. The look has a ${look.vibe} aesthetic. Professional lighting, sharp focus, full body visible from head to toe.`;
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
router.post("/generate", async (req, res) => {
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

    // Build profile context for AI
    const effectiveSizes = userSizes ?? profile?.sizes;
    const sizesText = effectiveSizes
      ? `Sizes: Top ${effectiveSizes.top || "unspecified"}, Bottom ${effectiveSizes.bottom || "unspecified"}, Shoes (US) ${effectiveSizes.shoes || "unspecified"}${effectiveSizes.dress ? `, Dress ${effectiveSizes.dress}` : ""}.`
      : "";

    const profileText = profile ? [
      profile.gender && profile.gender !== "prefer-not-to-say" ? `Gender: ${profile.gender}.` : "",
      profile.age ? `Age: ${profile.age}.` : "",
      profile.skinTone ? `Skin tone: ${profile.skinTone} — recommend makeup shades that complement this tone.` : "",
      profile.location ? `Location: ${profile.location} — prioritise brands and retailers that ship to or operate locally in this region before recommending global retailers.` : "",
      profile.stylePreferences?.length ? `Loves: ${profile.stylePreferences.join(", ")}.` : "",
      profile.avoidKeywords?.length ? `Avoid: ${profile.avoidKeywords.join(", ")}.` : "",
    ].filter(Boolean).join(" ") : "";

    const budgetText = maxBudget
      ? `IMPORTANT: Each complete look MUST have a total cost under $${maxBudget}. Prioritise affordable items — mix high-street and premium only if budget allows.`
      : "";

    const systemPrompt = `You are a world-class personal stylist. Create complete, shoppable outfit looks with real purchasable items from actual retailer websites.

Retailer priority:
1. LOCAL retailers shipping to / operating in the user's location (if provided)
2. REGIONAL retailers serving their market
3. GLOBAL retailers: Zara, ASOS, H&M, Free People, Anthropologie, Revolve, Nordstrom, Net-a-Porter, Farfetch, Mango, Reformation, Urban Outfitters, Madewell, SSENSE, Saks Fifth Avenue, Selfridges, ASOS, Boohoo, PrettyLittleThing

Return ONLY valid JSON. No markdown. No code fences.`;

    const userPrompt = `Create ${numLooks} DISTINCT outfit looks inspired by: "${body.prompt}"

${profileText}
${sizesText}
${budgetText}

Each look MUST be a completely different aesthetic/style. Include ALL item categories:
- Top OR Dress (choose one per look)
- Bottom (skip if using Dress)
- Shoes
- Bag
- Jewelry (earrings, necklace, bracelet, or ring — be specific)
- Accessories (sunglasses, hat, belt, scarf, or watch — be specific)
- Makeup (specify EXACT products: e.g. "MAC Matte Lipstick in Ruby Woo" — include the actual shade name and product)
- Hair (specific product recommendation: dry shampoo, hair oil, styling cream, etc.)

For Makeup, include a SPECIFIC product with an exact shade/color that complements the user's skin tone (${profile?.skinTone || "medium"}) and the look's vibe. Include the exact product page URL.

Return JSON:
{
  "looks": [
    {
      "id": "look-1",
      "title": "Look title",
      "vibe": "One sentence vibe description",
      "styleNotes": "2-3 sentences of styling tips",
      "totalCost": 0,
      "items": [
        {
          "category": "Top",
          "name": "Exact Product Name",
          "brand": "Brand Name",
          "description": "Brief description",
          "price": 45.99,
          "purchaseUrl": "https://www.brandwebsite.com/products/exact-product",
          "color": "specific color/shade name"
        }
      ]
    }
  ]
}

Calculate totalCost as the sum of all item prices.${maxBudget ? ` Every look MUST be under $${maxBudget}.` : ""}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const parsed = JSON.parse(content);
    const looks = (parsed.looks || []) as Array<{
      id: string;
      totalCost: number;
      items: ItemWithCategory[];
    }>;

    looks.forEach((look, i) => {
      look.id = `look-${i + 1}`;
      const total = look.items.reduce((sum, item) => sum + ((item as { price?: number }).price || 0), 0);
      look.totalCost = Math.round(total * 100) / 100;
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
router.post("/model-image", async (req, res) => {
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

    const clothingItems = look.items
      .filter(i => !["Hair", "Makeup"].includes(i.category))
      .map(i => `${i.color} ${i.name} (${i.category}) by ${i.brand}`)
      .join(", ");

    const hairItem = look.items.find(i => i.category === "Hair");
    const makeupItem = look.items.find(i => i.category === "Makeup");

    const hairDesc = hairItem ? hairItem.description : "natural styled hair";
    const makeupDesc = makeupItem ? `${makeupItem.name} — ${makeupItem.description}` : "natural makeup";

    const sizeContext = userSizes?.top ? `wearing size ${userSizes.top}` : "";
    const genderContext = profile?.gender === "man" ? "male" : "female";
    const skinContext = profile?.skinTone ? `with ${profile.skinTone} skin tone` : "";

    const imagePrompt = `Professional fashion editorial photograph. Full-length shot of a ${genderContext} model ${skinContext} ${sizeContext} standing against a clean minimal studio backdrop (soft grey). She is wearing: ${clothingItems}. Her hair is styled: ${hairDesc}. Full makeup: ${makeupDesc}. The look has a ${look.vibe} aesthetic. Professional lighting, sharp focus, full body visible from head to toe.`;

    const imageBuffer = await generateImageBuffer(imagePrompt, "1024x1024");
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
    const { profileId } = GetSavedOutfitsQueryParams.parse(req.query);
    const query = db.select().from(savedOutfitsTable);
    const outfits = await (profileId
      ? query.where(eq(savedOutfitsTable.profileId, profileId))
      : query
    ).orderBy(savedOutfitsTable.savedAt);
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
    const profileId = (body as { profileId?: string }).profileId ?? null;

    const [saved] = await db
      .insert(savedOutfitsTable)
      .values({
        profileId,
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
