import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { loginUser, logoutUser, registerUser } from "../controllers/user.ts";

const router = new Hono();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

const userRoutes = new Hono().route("/v1", router);
userRoutes.use(cors({
  origin: "https://familyboat.github.io/",
}));
export default userRoutes;
