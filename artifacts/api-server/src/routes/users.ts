import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { UpsertUserBody, GetUserParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = GetUserParams.parse(req.params);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.put("/", async (req, res) => {
  try {
    const body = UpsertUserBody.parse(req.body);
    const [user] = await db
      .insert(usersTable)
      .values({
        id: body.id,
        email: body.email ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: body.email ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to upsert user");
    res.status(500).json({ error: "Failed to save user" });
  }
});

export default router;