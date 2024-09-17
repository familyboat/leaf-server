import { superoak } from "superoak/mod.ts";
import { assertEquals } from "@std/assert";
import userRoutes from "../routes/user.ts";

const kv = await Deno.openKv();

/**
 * 清除测试数据
 */
async function deleteTestData() {
  await kv.delete(["users", "testuser"]);
}

let token = "";

Deno.test("POST /v1/register - should register a new user", async () => {
  await deleteTestData();

  const request = await superoak(userRoutes.fetch);
  await request
    .post("/v1/register")
    .send({
      username: "testuser",
      password: "testpass",
      confirmPassword: "testpass",
    })
    .expect(201)
    .expect("Content-Type", /json/)
    .expect((res) => {
      assertEquals(res.body.username, "testuser");
    });
});

Deno.test("POST /v1/login - should login a user", async () => {
  const request = await superoak(userRoutes.fetch);
  await request
    .post("/v1/login")
    .send({ username: "testuser", password: "testpass" })
    .expect(200)
    .expect("Content-Type", /json/)
    .expect((res) => {
      token = res.body.token;
      assertEquals(typeof res.body.token, "string");
    });
});

Deno.test("get /v1/auth/isLogin - should log in", async () => {
  const request = await superoak(userRoutes.fetch);
  await request.get("/v1/auth/isLogin").set("Authorization", `Bearer ${token}`)
    .expect(200).expect("Content-Type", /json/)
    .expect((res) => {
      assertEquals(res.body.isLogin, true);
    });
});

Deno.test("POST /v1/logout - should logout a user", async () => {
  const request = await superoak(userRoutes.fetch);
  await request
    .post("/v1/logout")
    .expect(200)
    .expect("Content-Type", /json/)
    .expect((res) => {
      assertEquals(res.body.message, "Logged out successfully");
    });
});
