import { Hono } from "@hono/hono";
import { authenticate } from "../middlewares/auth.ts";
import { createLeaf, getLeaves } from "../controllers/leaf.ts";

const router = new Hono();

router.post('/leaves', authenticate, createLeaf);
router.get('/leaves', getLeaves);

const leafRoutes = new Hono().route('/v1', router);
export default leafRoutes;
