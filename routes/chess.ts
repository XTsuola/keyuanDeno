// deno-lint-ignore-file
import { Router } from "https://deno.land/x/oak@v10.2.1/router.ts";
import {
  add,
  queryOne,
  update,
} from "../mongoDB/index.ts";
import { verifyToken } from "../verifyToken/index.ts";

export function chess(router: Router): void {
  router
    .get("/chess/getMap", verifyToken, async (ctx): Promise<void> => { // 象棋当前所有状态
      const data: any = await queryOne({ id: 1 }, "chess");
      if (!data) {
        ctx.response.body = {
          code: 0,
          msg: "棋盘数据不存在，请先调用 /chess/reset 初始化",
        };
        return;
      }
      ctx.response.body = {
        code: 200,
        rows: {
          id: 1,
          map: data.map,
          status: data.status,
          nowPlay: data.nowPlay,
        },
        msg: "查询成功",
      };
    })
    .get("/chess/reset", verifyToken, async (ctx): Promise<void> => { // 重置棋盘
      const defaultMap = [
        [13, 14, 15, 16, 17, 16, 15, 14, 13],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 12, 0, 0, 0, 0, 0, 12, 0],
        [11, 0, 11, 0, 11, 0, 11, 0, 11],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0, 1],
        [0, 2, 0, 0, 0, 0, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [3, 4, 5, 6, 7, 6, 5, 4, 3],
      ];
      const params = {
        map: defaultMap,
        status: 1,
        nowPlay: 1,
      };
      const existing = await queryOne({ id: 1 }, "chess");
      const data = existing
        ? await update({ id: 1 }, params, "chess")
        : await add({ id: 1, ...params }, "chess");
      ctx.response.body = {
        code: 200,
        rows: data,
        msg: "重置成功",
      };
    })
    .post("/chess/update", verifyToken, async (ctx): Promise<void> => { // 更新棋盘
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const obj: any = await queryOne({ id: 1 }, "chess");
      if (!obj?.map) {
        ctx.response.body = {
          code: 0,
          msg: "棋盘数据不存在，请先调用 /chess/reset 初始化",
        };
        return;
      }
      let status = 1;
      if (
        obj.map[params.index1][params.index2] == 17 ||
        obj.map[params.index1][params.index2] == 7
      ) {
        status = 2;
      }
      const indexOne: number = Math.floor(params.nowIndex / 10);
      const indexTwo: number = params.nowIndex % 10;
      obj.map[params.index1][params.index2] = params.qizi;
      obj.map[indexOne][indexTwo] = 0;
      await update({ id: 1 }, {
        map: obj.map,
        status: status,
        nowPlay: params.nowPlay == 1 ? 2 : 1,
      }, "chess");
      ctx.response.body = {
        code: 200,
        msg: "更新成功",
      };
    });
}
