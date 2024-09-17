import { Context, Next } from "@hono/hono";
import * as jose from "jose/index.ts";

const jwtSecret = Deno.env.get("JWT_SECRET");
const textEncoder = new TextEncoder();

/**
 * 认证 jwt
 */
export async function authenticate (c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (token === undefined) {
    return c.json({ error: "Empty token" }, 400);
  }

  if (jwtSecret === undefined) {
    return c.json({ error: "Invalid jwt secret" }, 400);
  }

  try {
    const {payload} = await jose.jwtVerify(
      token,
      textEncoder.encode(jwtSecret),
    );
    c.set("user", payload.value); // 将用户信息附加到上下文
    await next();
  } catch (_) {
    return c.json({ error: "Forbidden" }, 403);
  }
};