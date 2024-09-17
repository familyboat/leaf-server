import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import userRoutes from "./routes/user.ts";
import leafRoutes from "./routes/leaf.ts";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: Deno.env.get("ORIGIN") || "*",
  }),
);

app.get("/", (c) => {
  return c.text("Hi Hono!");
});

app.route("/", userRoutes);
app.route("/", leafRoutes);

Deno.serve(app.fetch);
