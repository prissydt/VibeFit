import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getStripeClient } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const signature = req.headers["stripe-signature"];

      if (!webhookSecret || !signature) {
        res.status(400).json({ error: "Stripe webhook is not configured" });
        return;
      }

      if (!Buffer.isBuffer(req.body)) {
        res.status(500).json({ error: "Webhook body was not received as a raw buffer" });
        return;
      }

      const event = getStripeClient().webhooks.constructEvent(
        req.body,
        Array.isArray(signature) ? signature[0] : signature,
        webhookSecret,
      );

      await WebhookHandlers.handleEvent(event);
      res.status(200).json({ received: true });
    } catch (err) {
      req.log.error({ err }, "Stripe webhook failed");
      res.status(400).json({ error: "Webhook processing error" });
    }
  },
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
