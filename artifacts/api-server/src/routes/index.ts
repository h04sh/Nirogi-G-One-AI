import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import diagnosisRouter from "./diagnosis";
import reportsRouter from "./reports";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(diagnosisRouter);
router.use(reportsRouter);
router.use(dashboardRouter);

export default router;
