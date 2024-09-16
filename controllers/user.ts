import { Context } from "@hono/hono";
import { User } from "../models/user.ts";
import * as jose from "jose/index.ts";

const kv = await Deno.openKv();
const jwtSecret = Deno.env.get("JWT_SECRET");

/**
 * 生成 jwt
 */
async function generateToken(
  payload: Record<string, unknown>,
  expireIn: string,
  secret: string,
) {
  const jwt = await new jose.SignJWT(payload).setProtectedHeader({
    alg: "HS256",
  }).setIssuedAt().setExpirationTime(expireIn).sign(
    new TextEncoder().encode(secret),
  );

  return jwt;
}

/**
 * 用户注册
 */
export async function registerUser(c: Context) {
  const { username, password, confirmPassword } = await c.req.json();

  if (!username || !password || !confirmPassword) {
    return c.json({
      error: "Username, password, confirmPassword are required",
    }, 400);
  }

  if (password !== confirmPassword) {
    return c.json({
      error: "Password must be equal with confirmPassword",
    }, 400);
  }

  const existingUser = await kv.get(["users", username]);
  if (existingUser.value) {
    return c.json({
      error: "Username already exists",
    }, 409);
  }

  const user: User = {
    id: crypto.randomUUID(),
    username,
    password,
  };

  await kv.set(["users", username], user);
  return c.json(user, 201);
}

/**
 * 用户登录
 */
export async function loginUser(c: Context) {
  const { username, password } = await c.req.json() as Omit<User, "id">;

  if (!username || !password) {
    return c.json({
      error: "Username and password are required",
    }, 400);
  }

  const user = await kv.get<User>(["users", username]);
  if (!user.value || user.value.password !== password) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  if (jwtSecret === undefined) {
    return c.json({ error: "Invalid jwt secret" }, 400);
  }

  const token = await generateToken(user, "1h", jwtSecret);

  return c.json({ token }, 200);
}

export function logoutUser(c: Context) {
  return c.json({ message: "Logged out successfully" }, 200);
}
