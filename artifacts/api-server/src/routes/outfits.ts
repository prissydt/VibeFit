import { Router, type IRouter } from "express";
import { db, savedOutfitsTable, outfitLookSchema, userSizesSchema } from "@workspace/db";
import {
  GenerateOutfitsBody,
  GenerateModelImageBody,
  SaveOutfitBody,
  GetSavedOutfitParams,
  DeleteSavedOutfitParams,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Canonical body-region hotspot positions as percentage of image (x%, y%)
// These map categories to approximate body positions on a fashion model photo
function getHotspotsForLook(items: Array<{ category: string }>) {
  const REGION_MAP: Record<string, { xPct: number; yPct: number }> = {
    "Hair":        { xPct: 50, yPct: 7 },
    "Makeup":      { xPct: 50, yPct: 14 },
    "Jewelry":     { xPct: 50, yPct: 22 },
    "Accessories": { xPct: 80, yPct: 30 },
    "Top":         { xPct: 50, yPct: 32 },
    "Dress":       { xPct: 50, yPct: 45 },
    "Bag":         { xPct: 78, yPct: 52 },
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
    const numLooks = body.numLooks ?? 3;
    const userSizes = body.userSizes as { top?: string; bottom?: string; shoes?: string; dress?: string } | undefined;

    const sizesText = userSizes
      ? `User sizes: Top: ${userSizes.top || "not specified"}, Bottom: ${userSizes.bottom || "not specified"}, Shoes (US): ${userSizes.shoes || "not specified"}${userSizes.dress ? `, Dress: ${userSizes.dress}` : ""}.`
      : "";

    const systemPrompt = `You are a world-class personal stylist and fashion director. When given an outfit idea or inspiration, you create complete, cohesive outfit "looks" with real, shoppable items.

Curate items from real retailers: Zara, ASOS, H&M, Free People, Anthropologie, Revolve, Nordstrom, Net-a-Porter, Farfetch, Mango, SHEIN, PrettyLittleThing, Topshop, Urban Outfitters, Madewell, Everlane, Reformation, SSENSE, Matches Fashion, Saks Fifth Avenue.

Return ONLY valid JSON with no markdown, no code fences, no extra text.`;

    const userPrompt = `Create ${numLooks} distinct outfit looks inspired by: "${body.prompt}"
${sizesText}

Each look should be completely different in style/aesthetic. Include items across ALL these categories: Top (or Dress), Bottom (skip if using Dress), Shoes, Bag, Jewelry, Accessories (sunglasses/hat/belt/scarf), Makeup, Hair.

Return JSON:
{
  "looks": [
    {
      "id": "look-1",
      "title": "Look title",
      "vibe": "One sentence describing the aesthetic",
      "styleNotes": "2-3 sentences of styling tips for this look",
      "totalCost": 0,
      "items": [
        {
          "category": "Top",
          "name": "Exact Product Name",
          "brand": "Brand Name",
          "description": "Brief description of the piece",
          "price": 45.99,
          "purchaseUrl": "https://www.brandwebsite.com/products/product-slug",
          "color": "specific color name"
        }
      ]
    }
  ]
}

Calculate totalCost as the sum of all item prices. Purchase URLs must be realistic URLs from the brand's actual website.`;

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
      items: Array<{ category: string; price: number }>;
    }>;

    looks.forEach((look, i) => {
      look.id = `look-${i + 1}`;
      const total = look.items.reduce((sum, item) => sum + (item.price || 0), 0);
      look.totalCost = Math.round(total * 100) / 100;
    });

    res.json({ prompt: body.prompt, looks, userSizes: userSizes ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to generate outfits");
    res.status(500).json({ error: "Failed to generate outfits" });
  }
});

// POST /outfits/model-image
// Generates an AI model image wearing the look and returns hotspot positions
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

    // Build clothing description for the image prompt
    const clothingItems = look.items
      .filter(i => !["Hair", "Makeup"].includes(i.category))
      .map(i => `${i.color} ${i.name} (${i.category}) by ${i.brand}`)
      .join(", ");

    const hairItem = look.items.find(i => i.category === "Hair");
    const makeupItem = look.items.find(i => i.category === "Makeup");

    const hairDesc = hairItem ? hairItem.description : "natural styled hair";
    const makeupDesc = makeupItem ? makeupItem.description : "natural makeup";

    // Infer body type context from sizes if available
    const sizeContext = userSizes?.top ? `wearing size ${userSizes.top}` : "";

    const imagePrompt = `Fashion editorial photograph. Full-length shot of a female model ${sizeContext} standing against a clean minimal studio background. She is wearing: ${clothingItems}. Her hair is styled as: ${hairDesc}. Makeup: ${makeupDesc}. The look has a ${look.vibe} aesthetic. Professional fashion photography lighting, sharp focus, high resolution, photorealistic. Full body visible from head to toe. Neutral light grey backdrop.`;

    const imageBuffer = await generateImageBuffer(imagePrompt, "1024x1024");
    const b64 = imageBuffer.toString("base64");

    const hotspots = getHotspotsForLook(look.items);

    res.json({
      lookId: look.id,
      modelImageB64: b64,
      hotspots,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate model image");
    res.status(500).json({ error: "Failed to generate model image" });
  }
});

// GET /outfits/saved
router.get("/saved", async (req, res) => {
  try {
    const outfits = await db.select().from(savedOutfitsTable).orderBy(savedOutfitsTable.savedAt);
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
    const [outfit] = await db
      .select()
      .from(savedOutfitsTable)
      .where(eq(savedOutfitsTable.id, id));
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

    const [saved] = await db
      .insert(savedOutfitsTable)
      .values({
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
