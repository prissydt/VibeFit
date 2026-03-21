import { Router, type IRouter } from "express";
import healthRouter from "./health";
import outfitsRouter from "./outfits";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/outfits", outfitsRouter);
router.use("/profile", profileRouter);

export default router;
