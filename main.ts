import { Hono } from "@hono/hono";
import userRoutes from "./routes/user.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hi Hono!");
});

app.route("/", userRoutes);

Deno.serve(app.fetch);
