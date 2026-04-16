import type Stripe from "stripe";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function getUserIdFromSubscription(subscription: Stripe.Subscription) {
  return subscription.metadata?.userId;
}

export class WebhookHandlers {
  static async handleEvent(event: Stripe.Event) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        await db
          .update(usersTable)
          .set({
            stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
            subscriptionStatus: "active",
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, userId));
      }
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = getUserIdFromSubscription(subscription);

      if (userId) {
        await db
          .update(usersTable)
          .set({
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, userId));
      }
    }
  }
}