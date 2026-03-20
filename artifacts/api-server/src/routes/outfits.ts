import { Router, type IRouter } from "express";
import { db, savedOutfitsTable, outfitLookSchema, userSizesSchema } from "@workspace/db";
import { GenerateOutfitsBody, SaveOutfitBody, GetSavedOutfitParams, DeleteSavedOutfitParams } from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/generate", async (req, res) => {
  try {
    const body = GenerateOutfitsBody.parse(req.body);
    const numLooks = body.numLooks ?? 3;

    const systemPrompt = `You are a world-class personal stylist and fashion expert. When given an outfit idea or inspiration, you create complete, cohesive outfit "looks" with real, purchasable items from actual retailers.

For each look, provide:
- A compelling title and vibe description
- Complete outfit items covering: tops, bottoms (or dress), shoes, bag, jewelry, accessories, makeup, and hair
- Real brand names and product names (use well-known brands like Zara, ASOS, H&M, Free People, Anthropologie, Revolve, Nordstrom, SHEIN, PrettyLittleThing, Mango, etc.)
- Realistic prices
- Realistic purchase URLs from actual retailer websites (format: https://www.brand.com/products/product-name)
- Specific colors and descriptions

Return ONLY valid JSON with no markdown or extra text.`;

    const userPrompt = `Create ${numLooks} distinct outfit looks inspired by: "${body.prompt}"

Each look should be completely different in style/aesthetic but all inspired by the theme.

Return JSON in this exact format:
{
  "looks": [
    {
      "id": "look-1",
      "title": "Look title",
      "vibe": "One sentence describing the aesthetic",
      "styleNotes": "2-3 sentences of styling tips",
      "totalCost": 0,
      "items": [
        {
          "category": "Top",
          "name": "Product Name",
          "brand": "Brand Name",
          "description": "Brief description",
          "price": 45.99,
          "purchaseUrl": "https://www.brandname.com/products/product-name",
          "color": "color name"
        }
      ]
    }
  ]
}

Include items for these categories: Top (or use Dress if applicable), Bottom (skip if using Dress), Shoes, Bag, Jewelry, Accessories (sunglasses/hat/belt), Makeup, Hair (products/style recommendation).
Calculate totalCost as sum of all item prices.`;

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
    const looks = parsed.looks || [];

    looks.forEach((look: { totalCost: number; items: Array<{ price: number }> }, i: number) => {
      look.id = `look-${i + 1}`;
      const total = look.items.reduce((sum: number, item: { price: number }) => sum + (item.price || 0), 0);
      look.totalCost = Math.round(total * 100) / 100;
    });

    res.json({ prompt: body.prompt, looks });
  } catch (err) {
    req.log.error({ err }, "Failed to generate outfits");
    res.status(500).json({ error: "Failed to generate outfits" });
  }
});

router.get("/saved", async (req, res) => {
  try {
    const outfits = await db.select().from(savedOutfitsTable).orderBy(savedOutfitsTable.savedAt);
    res.json({ outfits: outfits.reverse() });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch saved outfits");
    res.status(500).json({ error: "Failed to fetch saved outfits" });
  }
});

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
