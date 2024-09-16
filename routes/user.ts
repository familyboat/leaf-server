import { Hono } from "@hono/hono";
import { loginUser, logoutUser, registerUser } from "../controllers/user.ts";

const router = new Hono();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

const userRoutes = new Hono().route("/v1", router);
export default userRoutes;
