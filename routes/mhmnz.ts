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

export function mhmnz(router: Router): void {
  router
    .get("/mhmnz/getHeroList", verifyToken, async (ctx): Promise<void> => { // 获取英雄列表
      const params: any = helpers.getQuery(ctx);
      let sql: any = {};
      for (let key in params) {
        if (key == "name" || key == "skillGroup" || key == "arms" || key == "skin") {
          sql = { ...sql, [key]: { "$regex": params[key] } };
        } else {
          if (parseInt(params[key])) {
            sql = { ...sql, [key]: parseInt(params[key]) };
          }
        }
      }
      const total: number = await queryCount(sql, "mhmnzHero");
      const data: Document = await queryAll(
        sql,
        "mhmnzHero",
        parseInt(params.pageSize),
        parseInt(params.pageNo),
      );
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "total": total,
        "msg": "查询成功",
      };
    }).post("/mhmnz/addHero", verifyToken, async (ctx): Promise<void> => { // 新增英雄信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("mhmnzHero");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        gender: params.gender,
        star: params.star,
        camp: params.camp,
        exclusive: params.exclusive,
        arms: params.arms,
        armList: params.armList,
        superSkill: params.superSkill,
        skillGroup: params.skillGroup,
        castGrainSkill: params.castGrainSkill,
        talent: params.talent,
        skin: params.skin,
        introduce: params.introduce,
      };
      const data: any = await add(sql, "mhmnzHero");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post("/mhmnz/updateHero", verifyToken, async (ctx): Promise<void> => { // 修改英雄信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const param1 = { id: parseInt(params.id) };
      const param2 = {
        id: params.id,
        name: params.name,
        gender: params.gender,
        star: params.star,
        camp: params.camp,
        exclusive: params.exclusive,
        arms: params.arms,
        armList: params.armList,
        superSkill: params.superSkill,
        skillGroup: params.skillGroup,
        castGrainSkill: params.castGrainSkill,
        talent: params.talent,
        skin: params.skin,
        introduce: params.introduce,
      };
      const data = await update(param1, param2, "mhmnzHero");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).delete("/mhmnz/deleteHero", verifyToken, async (ctx): Promise<void> => { // 删除英雄信息
      const params: any = helpers.getQuery(ctx);
      const sql = { id: parseInt(params.id) };
      const data: number = await deleteData(sql, "mhmnzHero");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    }).get("/mhmnz/getArmsList", verifyToken, async (ctx): Promise<void> => { // 获取兵种列表
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
      const total: number = await queryCount(sql, "mhmnzArms");
      const data: Document[] = await queryAll(
        sql,
        "mhmnzArms",
        parseInt(params.pageSize),
        parseInt(params.pageNo),
      );
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "total": total,
        "msg": "查询成功",
      };
    }).post("/mhmnz/addArms", verifyToken, async (ctx): Promise<void> => { // 新增兵种信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("mhmnzArms");
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
        def: params.def,
        mof: params.mof,
        talent: params.talent,
        skin: params.skin,
        remark: params.remark,
      };
      const data: any = await add(sql, "mhmnzArms");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post("/mhmnz/updateArms", verifyToken, async (ctx): Promise<void> => { // 修改兵种信息
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
        def: params.def,
        mof: params.mof,
        talent: params.talent,
        skin: params.skin,
        remark: params.remark,
      };
      const data = await update(param1, param2, "mhmnzArms");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).delete("/mhmnz/deleteArms", verifyToken, async (ctx): Promise<void> => { // 删除兵种信息
      const params: any = helpers.getQuery(ctx);
      const sql = { id: parseInt(params.id) };
      const data: number = await deleteData(sql, "mhmnzArms");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    }).get("/mhmnz/getWeaponList", verifyToken, async (ctx): Promise<void> => { // 获取武器列表
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
      const total: number = await queryCount(sql, "mhmnzWeapon");
      const data: Document[] = await queryAll(
        sql,
        "mhmnzWeapon",
        parseInt(params.pageSize),
        parseInt(params.pageNo),
      );
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "total": total,
        "msg": "查询成功",
      };
    }).post("/mhmnz/addWeapon", verifyToken, async (ctx): Promise<void> => { // 新增武器信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("mhmnzWeapon");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        star: params.star,
        weaponType: params.weaponType,
        isExclusive: params.isExclusive,
        shuxing: params.shuxing,
        introduce: params.introduce,
        remark: params.remark,
      };
      const data: any = await add(sql, "mhmnzWeapon");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post("/mhmnz/updateWeapon", verifyToken, async (ctx): Promise<void> => { // 修改武器信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const param1 = { id: parseInt(params.id) };
      const param2 = {
        id: params.id,
        name: params.name,
        star: params.star,
        weaponType: params.weaponType,
        isExclusive: params.isExclusive,
        shuxing: params.shuxing,
        introduce: params.introduce,
        remark: params.remark,
      };
      const data = await update(param1, param2, "mhmnzWeapon");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).delete("/mhmnz/deleteWeapon", verifyToken, async (ctx): Promise<void> => { // 删除武器信息
      const params: any = helpers.getQuery(ctx);
      const sql = { id: parseInt(params.id) };
      const data: number = await deleteData(sql, "mhmnzWeapon");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    });
}
