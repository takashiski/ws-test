import { WebSocket } from "ws";
import fs from "fs";

const targetId = "16805283"; //ういはら
// const targetId = "16406075";//九々くま
// const targetId = "16540891";
const url = `wss://chat.mixch.tv/torte/room/${targetId}`;
if (!(fs.existsSync(`out/${targetId}`))) {
    fs.mkdirSync(`out/${targetId}`);
}
const logfilepath = `out/${targetId}/log.json`;
const itemsfilepath = `out/${targetId}/items.json`;
const ws = new WebSocket(url);

const itemCounts = fs.existsSync(itemsfilepath) ? JSON.parse(fs.readFileSync(itemsfilepath, { encoding: "utf-8" })) : {};
ws.onopen = e => {
    console.log("接続しました");
    console.log(url);
    // console.log(e);
}
ws.onmessage = (e) => {
    const json = JSON.parse(e.data);
    let str = "";
    // let str = json.kind + ", ";
    switch (json.kind) {
        case 42: //スパコメ
            str += `${json.kind}, ${json.name}, ${json.body}, ${json.item_id}, ${json.resource_id}`;
            break;
        case 0: //通常コメント
            str += `${json.kind}, ${json.name}, ${json.body}`;
            break;
        case 45: //スタンプ
        case 46: //ポイポイ
        case 48: //ギフト
            str += `${json.kind}, ${json.name}, ${json.item_id}, ${json.resource_id}, ${json.count}`
            break;
        case 10: //配信状態の変更通知？
        case 50: //シェア
        case 62: //ファン登録
        default:
            break;
    }
    if (json.resource_id) {
        if (itemCounts[json.resource_id]) {
            itemCounts[json.resource_id].member.push(json.name);
            itemCounts[json.resource_id].count += Number(json.count);
        } else {
            itemCounts[json.resource_id] = {};
            itemCounts[json.resource_id].member = [];
            itemCounts[json.resource_id].member.push(json.name);
            itemCounts[json.resource_id].count = Number(json.count);
        }
        fs.writeFileSync(itemsfilepath, JSON.stringify(itemCounts));
        console.log(`${new Date(Date.now()).toLocaleString()} new Item: ${json.resource_id} from ${json.name}, total is ${itemCounts[json.resource_id].count}`);
    }
    if (str != "") {
        fs.appendFileSync(logfilepath, str + "\n");
    }
}