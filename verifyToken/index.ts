import type { Context } from "oak";
import { decode } from "https://deno.land/x/djwt@v2.7/mod.ts";
import { queryOne } from "../mongoDB/index.ts";

/** Token validity window in minutes. */
const TOKEN_TTL_MINUTES = 600;

interface TokenPayload {
  account?: string;
  date?: number;
}

function getToken(ctx: Context): string | null {
  const headerToken = ctx.request.headers.get("token");
  if (headerToken) return headerToken.trim();

  const auth = ctx.request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }
  return null;
}

function unauthorized(ctx: Context, msg: string): void {
  ctx.response.body = { code: 401, msg };
}

export async function verifyToken(
  ctx: Context,
  next: () => Promise<unknown>,
): Promise<void> {
  const token = getToken(ctx);
  if (!token) {
    unauthorized(ctx, "未提供token，请重新登录！");
    return;
  }

  let payload: TokenPayload;
  try {
    payload = decode(token)[1] as TokenPayload;
  } catch {
    unauthorized(ctx, "token解析失败，请重新登录！");
    return;
  }

  if (!payload?.account || typeof payload.date !== "number") {
    unauthorized(ctx, "token无效，请重新登录！");
    return;
  }

  const elapsedMinutes = (Date.now() - payload.date) / 60_000;
  if (elapsedMinutes >= TOKEN_TTL_MINUTES) {
    unauthorized(ctx, "身份已经过期，请重新登录！");
    return;
  }

  const stored = await queryOne({ account: payload.account }, "token");
  if (!stored) {
    unauthorized(ctx, "登录状态不存在，请重新登录！");
    return;
  }
  if (stored.token !== token) {
    unauthorized(ctx, "登录状态已失效，请重新登录！");
    return;
  }

  await next();
}
