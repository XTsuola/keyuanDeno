import type { Context } from "oak";
import { verify } from "https://deno.land/x/djwt@v2.7/mod.ts";
import { queryOne } from "../mongoDB/index.ts";
import { key } from "./key.ts";

/** Token validity window in minutes (matches previous 600-minute check). */
const TOKEN_TTL_MINUTES = 600;

interface TokenPayload {
  account: string;
  date: number;
}

function unauthorized(
  ctx: Context,
  msg = "身份已经过期，请重新登录！",
): void {
  ctx.response.body = { code: 401, msg };
}

export async function verifyToken(
  ctx: Context,
  next: () => Promise<unknown>,
): Promise<void> {
  const token = ctx.request.headers.get("token");
  if (!token) {
    unauthorized(ctx);
    return;
  }

  try {
    const payload = await verify(token, key) as unknown as TokenPayload;
    if (!payload?.account || typeof payload.date !== "number") {
      unauthorized(ctx);
      return;
    }

    const elapsedMinutes = (Date.now() - payload.date) / 60_000;
    if (elapsedMinutes >= TOKEN_TTL_MINUTES) {
      unauthorized(ctx);
      return;
    }

    const stored = await queryOne({ account: payload.account }, "token");
    if (!stored || stored.token !== token) {
      unauthorized(ctx);
      return;
    }

    await next();
  } catch {
    unauthorized(ctx);
  }
}
