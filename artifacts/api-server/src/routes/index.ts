import { Router, type IRouter } from "express";
import healthRouter from "./health";
import outfitsRouter from "./outfits";
import profileRouter from "./profile";
import usersRouter from "./users";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/outfits", outfitsRouter);
router.use("/profile", profileRouter);
router.use("/users", usersRouter);
router.use("/payments", paymentsRouter);

export default router;
