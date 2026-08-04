import {
  Document,
  MongoClient,
} from "https://deno.land/x/mongo@v0.29.3/mod.ts";

type Filter = Record<string, unknown>;

/** Strip pagination fields without mutating the caller's object. */
function withoutPage(params: Filter): Filter {
  const { pageSize: _pageSize, pageNo: _pageNo, ...filter } = params;
  return filter;
}

const client = new MongoClient();
await client.connect(
  Deno.env.get("MONGODB_URI") ?? "mongodb://127.0.0.1:27017",
);
const db = client.database(Deno.env.get("MONGODB_DB") ?? "keyuan");

/** 查询总数 */
export async function queryCount(
  params: Filter,
  tableName: string,
): Promise<number> {
  return await db.collection(tableName).count(withoutPage(params));
}

/** 按 life 降序查询所有 */
export async function queryAll2(
  params: Filter,
  tableName: string,
): Promise<Document[]> {
  return await db.collection(tableName).find(params).sort({ life: -1 })
    .toArray();
}

/** 查询列表（可选分页、按 id 降序） */
export async function queryAll(
  params: Filter,
  tableName: string,
  pageSize?: number,
  pageNo?: number,
  sort?: number,
): Promise<Document[]> {
  const filter = withoutPage(params);
  let cursor = db.collection(tableName).find(filter);

  if (sort === -1) {
    cursor = cursor.sort({ id: -1 });
  }
  if (pageSize && pageNo) {
    cursor = cursor.skip((pageNo - 1) * pageSize).limit(pageSize);
  }

  return await cursor.toArray();
}

/** 查询单条 */
export async function queryOne(
  data: Filter,
  tableName: string,
): Promise<Document | undefined> {
  return await db.collection(tableName).findOne(data);
}

/** 新增 */
export async function add(
  data: Filter,
  tableName: string,
): Promise<unknown> {
  return await db.collection(tableName).insertOne(data);
}

/** 修改单条 */
export async function update(
  filter: Filter,
  data: Filter,
  tableName: string,
) {
  return await db.collection(tableName).updateOne(filter, { $set: data });
}

/** 查询最后一条 */
export async function findLast(tableName: string): Promise<Document[]> {
  return await db.collection(tableName).find({}).sort({ _id: -1 }).limit(1)
    .toArray();
}

/** 删除单条 */
export async function deleteData(
  data: Filter,
  tableName: string,
): Promise<number> {
  return await db.collection(tableName).deleteOne(data);
}

/** 批量修改 */
export async function updateAll(
  filter: Filter,
  data: Filter,
  tableName: string,
) {
  return await db.collection(tableName).updateMany(filter, { $set: data });
}
