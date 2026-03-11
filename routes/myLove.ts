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
import { decode } from "https://deno.land/std@0.138.0/encoding/base64.ts";
import { verifyToken } from "../verifyToken/index.ts";

export function myLove(router: Router): void {
  router
    .get("/myLove/photoList", verifyToken, async (ctx): Promise<void> => { // 获取照片列表
      let sql: any = {};
      const data: Document[] = await queryAll(sql, "photo"); 
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "查询成功",
      };
    }).post("/myLove/addPhoto", verifyToken, async (ctx): Promise<void> => { // 新增照片
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("photo");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      try {
        const imgName: string = `id_${new Date(params.createTime)}.${params.imgType}`;
        const path = `${Deno.cwd()}/public/photoImg/${imgName}`;
        const base64: any = params.url.replace(/^data:image\/\w+;base64,/, "");
        const dataBuffer: Uint8Array = decode(base64);
        await Deno.writeFile(path, dataBuffer);
        const sql = {
          id: id + 1,
          name: params.name,
          url: imgName,
          createTime: params.createTime,
          remark: params.remark,
        };
        const data = await add(sql, "photo");
        ctx.response.body = {
          "code": 200,
          "rows": data,
          "msg": "新增成功",
        };
      } catch (error) {
        throw (error);
      }
    }).delete("/myLove/deletePhoto", verifyToken, async (ctx): Promise<void> => { // 删除照片
      const params: any = helpers.getQuery(ctx);
      if (params.url) {
        Deno.remove(`${Deno.cwd()}/public/photoImg/${params.url}`);
      }
      const sql = { _id: new ObjectId(params._id) };
      const data: number = await deleteData(sql, "photo");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    }).get("/myLove/getCookList", verifyToken, async (ctx): Promise<void> => { // 获取菜谱列表
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
      const total: number = await queryCount(sql, "cook");
      const data: Document[] = await queryAll(
        sql,
        "cook",
        parseInt(params.pageSize),
        parseInt(params.pageNo),
      );
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "total": total,
        "msg": "查询成功",
      };
    }).post("/myLove/addCook", verifyToken, async (ctx): Promise<void> => { // 新增菜谱
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const lastInfo: Document[] = await findLast("cook");
      let id: number = 0;
      if (lastInfo.length) {
        id = lastInfo[0].id;
      }
      const sql = {
        id: id + 1,
        name: params.name,
        cookType: params.cookType,
        hunsu: params.hunsu,
        mastery: params.mastery,
        foodMaterials: params.foodMaterials,
        practice: params.practice,
        count: params.count,
        remark: params.remark,
      };
      const data: any = await add(sql, "cook");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "新增成功",
      };
    }).post("/myLove/updateCook", verifyToken, async (ctx): Promise<void> => { // 修改菜谱
      const params: any = await ctx.request.body({
        type: "json",
      }).value;
      const param1 = { _id: new ObjectId(params._id) };
      const param2 = {
        id: params.id,
        name: params.name,
        cookType: params.cookType,
        hunsu: params.hunsu,
        mastery: params.mastery,
        foodMaterials: params.foodMaterials,
        practice: params.practice,
        count: params.count,
        remark: params.remark,
      };
      const data = await update(param1, param2, "cook");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "修改成功",
      };
    }).get("/myLove/deleteCook", verifyToken, async (ctx): Promise<void> => { // 删除菜谱
      const params: any = helpers.getQuery(ctx);
      const sql = { _id: new ObjectId(params._id) };
      const data: number = await deleteData(sql, "cook");
      ctx.response.body = {
        "code": 200,
        "rows": data,
        "msg": "删除成功",
      };
    });
}
