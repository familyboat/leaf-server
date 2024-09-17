import { Context } from "@hono/hono";
import { User } from "../models/user.ts";
import * as jose from "jose/index.ts";
import * as bcrypt from "bcrypt/mod.ts";

const kv = await Deno.openKv();
const jwtSecret = Deno.env.get("JWT_SECRET");
const textEncoder = new TextEncoder();

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
    textEncoder.encode(secret),
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

  const passwordHash = bcrypt.hashSync(password);

  const user: User = {
    id: crypto.randomUUID(),
    username,
    password: passwordHash,
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
  if (
    !user.value || !(await bcrypt.compareSync(password, user.value.password))
  ) {
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

export async function isLoginUser(c: Context) {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.split(" ")[1];
  if (token === undefined) {
    return c.json({ error: "Empty token" }, 400);
  }

  if (jwtSecret === undefined) {
    return c.json({ error: "Invalid jwt secret" }, 400);
  }
  try {
    await jose.jwtVerify(
      token,
      textEncoder.encode(jwtSecret),
    );
    return c.json({ isLogin: true }, 200);
  } catch (_) {
    return c.json({ isLogin: false }, 200);
  }
}
