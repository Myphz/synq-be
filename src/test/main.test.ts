import express from "express";
import assert from "node:assert";
import test, { describe } from "node:test";
import request from "supertest";
import { errorHandler } from "../middlewares/error.js";
import { TestAPI } from "../routes/test.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", TestAPI);
app.use(errorHandler);

describe("Backend Testing", () => {
  test("POST / - stupid test", async () => {
    const res = await request(app).post(`/`);
    assert.strictEqual(res.status, 201);
  });
});
