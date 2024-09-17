import { Context } from "@hono/hono";
import { User } from "../models/user.ts";
import { Leaf } from "../models/leaf.ts";

const kv = await Deno.openKv();

export async function createLeaf(c: Context) {
  const { title, content } = await c.req.json();
  const user = c.get("user") as User;

  if (!title || !content) {
    return c.json({ message: "Title and content are required" }, 400);
  }

  const leaf: Leaf = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString(),
    user: {
      id: user.id,
      username: user.username
    }
  };

  const key = ["leaves", leaf.createdAt, leaf.id, user.id];
  await kv.set(key, leaf);

  return c.json(leaf, 201);
}

export async function getLeaves(c: Context) {
  const { cursor, limit } = c.req.query();

  const pageCursor = cursor ? decodeURIComponent(cursor) : undefined;
  const pageLimit = limit ? parseInt(limit, 10) : 10;

  const leaves: Leaf[] = [];
  const iter = kv.list({ prefix: ["leaves"] }, { limit: pageLimit, cursor: pageCursor });

  for await (const entry of iter) {
    leaves.push(entry.value as Leaf);
  }

  const nextCursor = iter.cursor;

  return c.json({ leaves, nextCursor });
}
