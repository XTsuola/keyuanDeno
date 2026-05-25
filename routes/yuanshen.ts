// deno-lint-ignore-file
import { Router } from "https://deno.land/x/oak@v10.2.1/router.ts";
import { helpers } from "https://deno.land/x/oak@v10.2.1/mod.ts";
import {
  add,
  deleteData,
  findLast,
  queryAll,
  queryCount,
  update,
} from "../mongoDB/index.ts";
import { Document, ObjectId } from "https://deno.land/x/mongo@v0.29.3/mod.ts";
import { verifyToken } from "../verifyToken/index.ts";

export function yuanshen(router: Router): void {
  router
    .get("/yuanshen/getHeroList", verifyToken, async (ctx): Promise<void> => { // 获取英雄列表
      const params: any = helpers.getQuery(ctx);
      let sql: any = {};
      for (let key in params) {
        if (key == "genter" || key == "star") {
          sql = { ...sql, [key]: parseInt(params[key]) };
        } else {
          sql = { ...sql, [key]: { "$regex": params[key] } };
        }
      }
      const total: number = await queryCount(sql, "yuanshenHero");
      const data: Document[] = await queryAll(
        sql,
        "yuanshenHero",
        parseInt(params.pageSize),
        parseInt(params.pageNo),
      );
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "total": total,
        "msg": "查询成功",
      };
    }).post("/yuanshen/addHero", verifyToken, async (ctx): Promise<void> => { // 新增英雄信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("yuanshenHero");
      let id: any = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: parseInt(id) + 1,
        name: params.name,
        genter: params.genter,
        figure: params.figure,
        star: params.star,
        country: params.country,
        element: params.element,
        weaponType: params.weaponType,
        constellation: params.constellation,
        birthday: params.birthday,
        remark: params.remark,
      };
      const data: any = await add(sql, "yuanshenHero");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post("/yuanshen/updateHero", verifyToken, async (ctx): Promise<void> => { // 修改英雄信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const param1 = { id: JSON.parse(params.id) };
      const param2 = {
        name: params.name,
        genter: params.genter,
        figure: params.figure,
        star: params.star,
        country: params.country,
        element: params.element,
        weaponType: params.weaponType,
        constellation: params.constellation,
        birthday: params.birthday,
        remark: params.remark,
      };
      console.log(param2);
      const data = await update(param1, param2, "yuanshenHero");
      console.log(data);
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).delete(
      "/yuanshen/deleteHero",
      verifyToken,
      async (ctx): Promise<void> => { // 删除英雄信息
        const params: any = helpers.getQuery(ctx);
        const sql = { id: JSON.parse(params.id) };
        const data: number = await deleteData(sql, "yuanshenHero");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "删除成功",
        };
      },
    );
}
