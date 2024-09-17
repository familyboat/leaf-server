import { Hono } from "@hono/hono";
import {
  isLoginUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.ts";

const router = new Hono();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/auth/isLogin", isLoginUser);

const userRoutes = new Hono().route("/v1", router);
export default userRoutes;
