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
import { Document } from "https://deno.land/x/mongo@v0.29.3/mod.ts";
import { verifyToken } from "../verifyToken/index.ts";

export function hywz(router: Router): void {
  router
    .get("/hywz/getArmsList", verifyToken, async (ctx): Promise<void> => { // 获取兵种列表
      const params: any = helpers.getQuery(ctx);
      let sql: any = {};
      for (let key in params) {
        if (key == "name") {
          sql = { ...sql, [key]: { "$regex": params[key] } };
        } else {
          if (parseInt(params[key])) {
            sql = { ...sql, [key]: parseInt(params[key]) };
          }
        }
      }
      const total: number = await queryCount(sql, "hywzArms");
      const data: Document[] = await queryAll(
        sql,
        "hywzArms",
        parseInt(params.pageSize),
        parseInt(params.pageNo),
      );
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "total": total,
        "msg": "查询成功",
      };
    }).post("/hywz/addArms", verifyToken, async (ctx): Promise<void> => { // 新增兵种信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("hywzArms");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        type: params.type,
        life: params.life,
        att: params.att,
        magic: params.magic,
        skill: params.skill,
        speed: params.speed,
        xingyun: params.xingyun,
        def: params.def,
        mof: params.mof,
        tige: params.tige,
        talent: params.talent,
        remark: params.remark,
      };
      const data: any = await add(sql, "hywzArms");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post("/hywz/updateArms", verifyToken, async (ctx): Promise<void> => { // 修改兵种信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const param1 = { id: parseInt(params.id) };
      const param2 = {
        id: params.id,
        name: params.name,
        type: params.type,
        life: params.life,
        att: params.att,
        magic: params.magic,
        skill: params.skill,
        speed: params.speed,
        xingyun: params.xingyun,
        def: params.def,
        mof: params.mof,
        tige: params.tige,
        talent: params.talent,
        remark: params.remark,
      };
      const data = await update(param1, param2, "hywzArms");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).delete("/hywz/deleteArms", verifyToken, async (ctx): Promise<void> => { // 删除兵种信息
      const params: any = helpers.getQuery(ctx);
      const sql = { id: parseInt(params.id) };
      const data: number = await deleteData(sql, "hywzArms");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    })
}
