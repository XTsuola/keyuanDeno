// deno-lint-ignore-file
import {
  Document,
  MongoClient,
} from "https://deno.land/x/mongo@v0.29.3/mod.ts";

function deletePage(obj: any) {
  delete obj.pageSize;
  delete obj.pageNo;
  return obj;
}

const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");
const db = client.database("keyuan");

// 查询总数
export async function queryCount(
  params: any,
  tableName: string,
): Promise<number> {
  let data = deletePage(params);
  const result = await db.collection(tableName).count(data);
  return result;
}

// 查询所有
export async function queryAll2(
  params: any,
  tableName: string,
): Promise<Document[]> {
  const result: Document[] = await db.collection(tableName).find(params).sort({
    life: -1,
  })
    .toArray();
  return result;
}

// 查询所有
export async function queryAll(
  params: any,
  tableName: string,
  pageSize?: number,
  pageNo?: number,
  sort?: number,
): Promise<Document[]> {
  let data = deletePage(params);
  if (pageSize && pageNo) {
    if (sort == -1) {
      const result: Document[] = await db.collection(tableName).find(data)
        .limit(
          pageSize,
        ).skip((pageNo - 1) * pageSize).sort({ id: -1 }).toArray();
      return result;
    } else {
      const result: Document[] = await db.collection(tableName).find(data)
        .limit(
          pageSize,
        ).skip((pageNo - 1) * pageSize).toArray();
      return result;
    }
  } else {
    if (sort == -1) {
      const result: Document[] = await db.collection(tableName).find(data).sort(
        { id: -1 },
      ).toArray();
      return result;
    } else {
      const result: Document[] = await db.collection(tableName).find(data)
        .toArray();
      return result;
    }
  }
}

// 查询单条信息
export async function queryOne(
  data: any,
  tableName: string,
): Promise<Document | undefined> {
  const result: Document | undefined = await db.collection(tableName).findOne(
    data,
  );
  return result;
}

// 新增数据
export async function add(
  data: any,
  tableName: string,
): Promise<any> {
  const result: any = await db.collection(tableName).insertOne(data);
  return result;
}

// 修改数据
export async function update(data1: any, data2: any, tableName: string) {
  const result = await db.collection(tableName).updateOne(data1, {
    $set: data2,
  });
  return result;
}

// 查询最后一条数据
export async function findLast(tableName: string): Promise<Document[]> {
  const result: Document[] = await db.collection(tableName).find({}).sort({
    _id: -1,
  })
    .limit(1).toArray();
  return result;
}

// 删除数据
export async function deleteData(
  data: any,
  tableName: string,
): Promise<number> {
  const result: number = await db.collection(tableName).deleteOne(data);
  return result;
}

// 修改所有数据
export async function updateAll(data1: any, data2: any, tableName: string) {
  const result = await db.collection(tableName).updateMany(data1, {
    $set: data2,
  });
  return result;
}
