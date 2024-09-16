import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import userRoutes from "./routes/user.ts";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: "https://familyboat.github.io",
  }),
);

app.get("/", (c) => {
  return c.text("Hi Hono!");
});

app.route("/", userRoutes);

Deno.serve(app.fetch);
