import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { getStripeClient } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const app: Express = express();

app.use(helmet());
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(cookieParser());
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

// Stripe webhook must receive raw body before json parser
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

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use("/api", router);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

export default app;
