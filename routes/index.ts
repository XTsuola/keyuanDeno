import { Router } from "https://deno.land/x/oak@v10.2.1/mod.ts";
import { login } from "./login.ts";
import { team } from "./team.ts";
import { kaoshi } from "./kaoshi.ts";
import { hywz } from "./hywz.ts";
import { xingta } from "./xingta.ts";
import { myLove } from "./myLove.ts";
import { mota } from "./mota.ts";
import { chess } from "./chess.ts";

const router = new Router();
const list = [
    login,
    team,
    kaoshi,
    hywz,
    xingta,
    mota,
    chess,
    myLove,
];

for(let i=0;i<list.length;i++) {
    list[i](router);
}

export default router;
