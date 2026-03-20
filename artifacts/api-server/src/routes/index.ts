import { Router, type IRouter } from "express";
import healthRouter from "./health";
import outfitsRouter from "./outfits";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/outfits", outfitsRouter);

export default router;
