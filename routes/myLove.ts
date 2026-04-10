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
    })
}
