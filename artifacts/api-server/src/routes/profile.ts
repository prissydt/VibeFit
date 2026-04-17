import { Router, type IRouter } from "express";
import { db, userProfilesTable } from "@workspace/db";
import { UpsertProfileBody } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(userProfilesTable)
      .where(eq(userProfilesTable.profileId, req.deviceId));

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.put("/", async (req, res) => {
  try {
    const body = UpsertProfileBody.parse(req.body);

    const [profile] = await db
      .insert(userProfilesTable)
      .values({
        profileId: req.deviceId,
        name: body.name ?? null,
        gender: body.gender ?? null,
        age: body.age ?? null,
        skinTone: body.skinTone ?? null,
        location: body.location ?? null,
        sizes: (body.sizes as object) ?? null,
        stylePreferences: (body.stylePreferences as string[]) ?? [],
        avoidKeywords: (body.avoidKeywords as string[]) ?? [],
        likedLookIds: (body.likedLookIds as string[]) ?? [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userProfilesTable.profileId,
        set: {
          name: body.name ?? null,
          gender: body.gender ?? null,
          age: body.age ?? null,
          skinTone: body.skinTone ?? null,
          location: body.location ?? null,
          sizes: (body.sizes as object) ?? null,
          stylePreferences: (body.stylePreferences as string[]) ?? [],
          avoidKeywords: (body.avoidKeywords as string[]) ?? [],
          likedLookIds: (body.likedLookIds as string[]) ?? [],
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json(profile);
  } catch (err) {
    req.log.error({ err }, "Failed to upsert profile");
    res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;
