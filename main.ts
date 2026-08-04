import { Application } from "oak";
import { oakCors } from "cors";
import router from "./routes/index.ts";

const app = new Application();

app.use(oakCors());
app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context, next: () => Promise<unknown>): Promise<void> => {
  try {
    await context.send({
      root: `${Deno.cwd()}/public`,
    });
  } catch {
    next();
  }
});

await app.listen({ port: 7147 });
