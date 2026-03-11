// deno-lint-ignore-file
import { Router } from "https://deno.land/x/oak@v10.2.1/router.ts";
import { helpers } from "https://deno.land/x/oak@v10.2.1/mod.ts";
import {
  add,
  deleteData,
  findLast,
  queryAll,
  queryOne,
  queryCount,
  update,
} from "../mongoDB/index.ts";
import { Document, ObjectId } from "https://deno.land/x/mongo@v0.29.3/mod.ts";
import { decode } from "https://deno.land/std@0.138.0/encoding/base64.ts";
import { verifyToken } from "../verifyToken/index.ts";

export function yuanshen(router: Router): void {
  router
    .get("/yuanshen/getHeroList", verifyToken, async (ctx): Promise<void> => { // 获取英雄列表
      const params: any = helpers.getQuery(ctx);
      let sql: any = {};
      for (let key in params) {
        if (key == "name") {
          sql = { ...sql, [key]: { "$regex": params[key] } };
        } else if (key == "starSign") {
          sql = { ...sql, remark: { "$regex": params[key] } };
        } else {
          if (parseInt(params[key])) {
            sql = { ...sql, [key]: parseInt(params[key]) };
          }
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
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      let img = "";
      if (params.img) {
        const baseName: string = params.name + ".jpg";
        try {
          await Deno.remove(`${Deno.cwd()}/public/yuanshen/hero/${baseName}`);
        } catch (_) { }
        if (params.img) {
          if (params.img != baseName) {
            const imgName: string = params.name + ".jpg";
            const path = `${Deno.cwd()}/public/yuanshenImg/hero/${imgName}`;
            const base64: any = params.img.replace(
              /^data:image\/\w+;base64,/,
              "",
            );
            const dataBuffer: Uint8Array = decode(base64);
            await Deno.writeFile(path, dataBuffer);
            img = baseName;
          } else {
            img = baseName;
          }
        }
      }
      const sql = {
        id: id + 1,
        name: params.name,
        gender: params.gender,
        country: params.country,
        arms: params.arms,
        shuxing: params.shuxing,
        breach: params.breach,
        lifeSeat: params.lifeSeat,
        star: params.star,
        firstLook: params.firstLook,
        birthday: params.birthday,
        remark: params.remark,
        img: img,
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
      const data1: any = await queryOne({ id: JSON.parse(params.id) }, "yuanshenHero");
      if (data1.img != params.img) {
        if (data1.img != "") {
          try {
            const path = `${Deno.cwd()}/public/yuanshenImg/hero/${data1.img}`;
            await Deno.remove(path);
          } catch (_) { }
        }
        if (params.img != "") {
          const imgName: string = params.name + ".jpg";
          const path = `${Deno.cwd()}/public/yuanshenImg/hero/${imgName}`;
          const base64: any = params.img.replace(
            /^data:image\/\w+;base64,/,
            "",
          );
          const dataBuffer: Uint8Array = decode(base64);
          try {
            await Deno.writeFile(path, dataBuffer);
          } catch (_) { }
          data1.img = imgName;
        }
      }
      const param1 = { id: JSON.parse(params.id) };
      const param2 = {
        id: params.id,
        name: params.name,
        gender: params.gender,
        country: params.country,
        arms: params.arms,
        shuxing: params.shuxing,
        breach: params.breach,
        lifeSeat: params.lifeSeat,
        star: params.star,
        firstLook: params.firstLook,
        birthday: params.birthday,
        remark: params.remark,
        img: data1.img,
      };
      const data = await update(param1, param2, "yuanshenHero");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).delete("/yuanshen/deleteHero", verifyToken, async (ctx): Promise<void> => { // 删除英雄信息
      const params: any = helpers.getQuery(ctx);
      const data1: any = await queryOne({ id: JSON.parse(params.id) }, "yuanshenHero");
      if (data1.img) {
        try {
          await Deno.remove(`${Deno.cwd()}/public/yuanshen/hero/${data1.img}`);
        } catch (_) { }
      }
      const sql = { id: JSON.parse(params.id) };
      const data2: number = await deleteData(sql, "yuanshenHero");
      ctx.response.body = {
        "code": 200,
        "rows": data2,
        "msg": "删除成功",
      };
    }).get(
      "/yuanshen/getWeaponList",
      verifyToken,
      async (ctx): Promise<void> => { // 获取武器列表
        const params: any = helpers.getQuery(ctx);
        let sql: any = {};
        for (let key in params) {
          if (key == "name" || key == "baseAttack" || key == "attribute") {
            sql = { ...sql, [key]: { "$regex": params[key] } };
          } else {
            if (parseInt(params[key])) {
              sql = { ...sql, [key]: parseInt(params[key]) };
            }
          }
        }
        const total: number = await queryCount(sql, "yuanshenWeapon");
        const data: Document[] = await queryAll(
          sql,
          "yuanshenWeapon",
          parseInt(params.pageSize),
          parseInt(params.pageNo),
        );
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "total": total,
          "msg": "查询成功",
        };
      },
    ).post("/yuanshen/addWeapon", verifyToken, async (ctx): Promise<void> => { // 新增武器信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("yuanshenWeapon");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        type: params.type,
        star: params.star,
        baseAttack: params.baseAttack,
        attribute: params.attribute,
        introduce: params.introduce,
        remark: params.remark,
      };
      const data: any = await add(sql, "yuanshenWeapon");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post(
      "/yuanshen/updateWeapon",
      verifyToken,
      async (ctx): Promise<void> => { // 修改武器信息
        const params: any = await ctx.request.body({
          type: "json",
        }).value;
        const param1 = { id: JSON.parse(params.id) };
        const param2 = {
          id: params.id,
          name: params.name,
          type: params.type,
          star: params.star,
          baseAttack: params.baseAttack,
          attribute: params.attribute,
          introduce: params.introduce,
          remark: params.remark,
        };
        const data = await update(param1, param2, "yuanshenWeapon");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "修改成功",
        };
      },
    ).delete("/yuanshen/deleteWeapon", verifyToken, async (ctx): Promise<void> => { // 删除武器信息
      const params: any = helpers.getQuery(ctx);
      const sql = { id: JSON.parse(params.id) };
      const data: number = await deleteData(sql, "yuanshenWeapon");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    }).get(
      "/yuanshen/getRelicsList",
      verifyToken,
      async (ctx): Promise<void> => { // 获取圣遗物列表
        const params: any = helpers.getQuery(ctx);
        let sql: any = {};
        for (let key in params) {
          if (key == "name" || key == "tag") {
            sql = { ...sql, [key]: { "$regex": params[key] } };
          } else {
            if (parseInt(params[key])) {
              sql = { ...sql, [key]: parseInt(params[key]) };
            }
          }
        }
        const total: number = await queryCount(sql, "yuanshenRelics");
        const data: Document[] = await queryAll(
          sql,
          "yuanshenRelics",
          parseInt(params.pageSize),
          parseInt(params.pageNo),
        );
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "total": total,
          "msg": "查询成功",
        };
      },
    ).post("/yuanshen/addRelics", verifyToken, async (ctx): Promise<void> => { // 新增圣遗物信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("yuanshenRelics");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        star: params.star,
        twoEffect: params.twoEffect,
        fourEffect: params.fourEffect,
        tag: params.tag,
        remark: params.remark,
      };
      const data = await add(sql, "yuanshenRelics");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post(
      "/yuanshen/updateRelics",
      verifyToken,
      async (ctx): Promise<void> => { // 修改圣遗物信息
        const params: any = await ctx.request.body({
          type: "json",
        }).value;
        const param1 = { id: JSON.parse(params.id) };
        const param2 = {
          id: params.id,
          name: params.name,
          star: params.star,
          twoEffect: params.twoEffect,
          fourEffect: params.fourEffect,
          tag: params.tag,
          remark: params.remark,
        };
        const data = await update(param1, param2, "yuanshenRelics");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "修改成功",
        };
      },
    ).delete("/yuanshen/deleteRelics", verifyToken, async (ctx): Promise<void> => { // 删除圣遗物信息
      const params: any = helpers.getQuery(ctx);
      const sql = { id: JSON.parse(params.id) };
      const data: number = await deleteData(sql, "yuanshenRelics");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    }).get(
      "/yuanshen/getEnemyList",
      verifyToken,
      async (ctx): Promise<void> => { // 获取怪物列表
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
        const total: number = await queryCount(sql, "yuanshenEnemy");
        const data: Document[] = await queryAll(
          sql,
          "yuanshenEnemy",
          parseInt(params.pageSize),
          parseInt(params.pageNo),
        );
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "total": total,
          "msg": "查询成功",
        };
      },
    ).post("/yuanshen/addEnemy", verifyToken, async (ctx): Promise<void> => { // 新增怪物信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("yuanshenEnemy");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        enemyType: params.enemyType,
        info: params.info,
        remark: params.remark,
      };
      const data = await add(sql, "yuanshenEnemy");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post(
      "/yuanshen/updateEnemy",
      verifyToken,
      async (ctx): Promise<void> => { // 修改怪物信息
        const params: any = await ctx.request.body({
          type: "json",
        }).value;
        const param1 = { id: JSON.parse(params.id) };
        const param2 = {
          id: params.id,
          name: params.name,
          enemyType: params.enemyType,
          info: params.info,
          remark: params.remark,
        };
        const data = await update(param1, param2, "yuanshenEnemy");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "修改成功",
        };
      },
    ).delete(
      "/yuanshen/deleteEnemy",
      verifyToken,
      async (ctx): Promise<void> => { // 删除怪物信息
        const params: any = helpers.getQuery(ctx);
        const sql = { id: JSON.parse(params.id) };
        const data: number = await deleteData(sql, "yuanshenEnemy");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "删除成功",
        };
      },
    ).get(
      "/yuanshen/getAbyssList",
      verifyToken,
      async (ctx): Promise<void> => { // 获取深渊12层怪物列表
        const params: any = helpers.getQuery(ctx);
        const sql = {
          $or: [
            { firstUpper: { "$regex": params.name } },
            { firstLower: { "$regex": params.name } },
            { secondUpper: { "$regex": params.name } },
            { secondLower: { "$regex": params.name } },
            { thirdUpper: { "$regex": params.name } },
            { thirdLower: { "$regex": params.name } },
          ],
        };
        const total: number = await queryCount(sql, "yuanshenAbyss");
        const data: Document[] = await queryAll(
          sql,
          "yuanshenAbyss",
          parseInt(params.pageSize),
          parseInt(params.pageNo),
        );
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "total": total,
          "msg": "查询成功",
        };
      },
    ).post("/yuanshen/addAbyss", verifyToken, async (ctx): Promise<void> => { // 新增深渊12层怪物信息
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("yuanshenAbyss");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        version: params.version,
        firstUpper: params.firstUpper,
        firstLower: params.firstLower,
        secondUpper: params.secondUpper,
        secondLower: params.secondLower,
        thirdUpper: params.thirdUpper,
        thirdLower: params.thirdLower,
        remark: params.remark,
      };
      const data = await add(sql, "yuanshenAbyss");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post(
      "/yuanshen/updateAbyss",
      verifyToken,
      async (ctx): Promise<void> => { // 修改深渊12层怪物信息
        const params: any = await ctx.request.body({
          type: "json",
        }).value;
        const param1 = { id: JSON.parse(params.id) };
        const param2 = {
          id: params.id,
          version: params.version,
          firstUpper: params.firstUpper,
          firstLower: params.firstLower,
          secondUpper: params.secondUpper,
          secondLower: params.secondLower,
          thirdUpper: params.thirdUpper,
          thirdLower: params.thirdLower,
          remark: params.remark,
        };
        const data = await update(param1, param2, "yuanshenAbyss");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "修改成功",
        };
      },
    ).delete(
      "/yuanshen/deleteAbyss",
      verifyToken,
      async (ctx): Promise<void> => { // 删除深渊12层怪物信息
        const params: any = helpers.getQuery(ctx);
        const sql = { id: JSON.parse(params.id) };
        const data: number = await deleteData(sql, "yuanshenAbyss");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "删除成功",
        };
      },
    );
}
