import { Router, type IRouter, type Request } from "express";
import { db, usersTable } from "@workspace/db";
import { CreateBillingPortalSessionBody, CreateCheckoutSessionBody, GetPaymentStatusQueryParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { getStripeClient, getStripePriceId, isStripeConfigured } from "../stripeClient";

const router: IRouter = Router();

function getBaseUrl(req: Request) {
  const configured = process.env.APP_BASE_URL ?? process.env.REPLIT_DOMAINS?.split(",")[0];
  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }
  return `${req.protocol}://${req.get("host")}`;
}

router.get("/status", async (req, res) => {
  try {
    const { userId } = GetPaymentStatusQueryParams.parse(req.query);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));

    res.json({
      configured: isStripeConfigured(),
      user: user ?? null,
      subscriptionStatus: user?.subscriptionStatus ?? null,
      hasActiveSubscription: ["active", "trialing"].includes(user?.subscriptionStatus ?? ""),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get payment status");
    res.status(500).json({ error: "Failed to get payment status" });
  }
});

router.post("/checkout", async (req, res) => {
  try {
    if (!isStripeConfigured()) {
      res.status(503).json({
        error: "Stripe checkout is not configured yet. Connect Stripe or add STRIPE_SECRET_KEY and STRIPE_PRICE_ID.",
      });
      return;
    }

    const body = CreateCheckoutSessionBody.parse(req.body);
    const stripe = getStripeClient();
    const priceId = getStripePriceId();
    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.id, body.userId));
    let user = existingUser;
    let customerId = user?.stripeCustomerId ?? null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: body.email,
        metadata: { userId: body.userId },
      });
      customerId = customer.id;
      const [savedUser] = await db
        .insert(usersTable)
        .values({
          id: body.userId,
          email: body.email,
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            email: body.email,
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          },
        })
        .returning();
      user = savedUser;
    }

    if (!user?.email && body.email) {
      await db
        .update(usersTable)
        .set({ email: body.email, updatedAt: new Date() })
        .where(eq(usersTable.id, body.userId));
    }

    const baseUrl = getBaseUrl(req);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/profile?payment=success`,
      cancel_url: `${baseUrl}/profile?payment=cancelled`,
      metadata: { userId: body.userId },
      subscription_data: {
        metadata: { userId: body.userId },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Failed to create checkout session");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post("/portal", async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      res.status(503).json({ error: "Stripe is not configured yet." });
      return;
    }

    const body = CreateBillingPortalSessionBody.parse(req.body);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, body.userId));

    if (!user?.stripeCustomerId) {
      res.status(404).json({ error: "No Stripe customer found for this user" });
      return;
    }

    const stripe = getStripeClient();
    const baseUrl = getBaseUrl(req);
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/profile`,
    });

    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Failed to create billing portal session");
    res.status(500).json({ error: "Failed to create billing portal session" });
  }
});

export default router;