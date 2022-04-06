import { WebSocket } from "ws";
import fs from "fs";

const re = /\d+/;
const members = [
    "https://mixch.tv/u/16540891",
    "https://mixch.tv/u/16845190",
    "https://mixch.tv/u/16805283",
    "https://mixch.tv/u/16818911",
    "https://mixch.tv/u/14119509",
    "https://mixch.tv/u/16768564",
    "https://mixch.tv/u/16815148",
    "https://mixch.tv/u/15390763",
    "https://mixch.tv/u/16406075",
    "https://mixch.tv/u/16530167",
    "https://mixch.tv/u/16813257",
    "https://mixch.tv/u/16840702",
    "https://mixch.tv/u/12566810",
    "https://mixch.tv/u/16307281",
    "https://mixch.tv/u/16845244",
    "https://mixch.tv/u/16550862",
    "https://mixch.tv/u/11767841",
    "https://mixch.tv/u/16479514",
    "https://mixch.tv/u/16476783",
    "https://mixch.tv/u/16833147",
    "https://mixch.tv/u/16827786",
    "https://mixch.tv/u/16830243",
    "https://mixch.tv/u/16817000",
    "https://mixch.tv/u/16825150",
    "https://mixch.tv/u/16827065",
    "https://mixch.tv/u/16316012"
];
const targetId = "16805283"; //ういはら
// const targetId = "16406075";//九々くま
// const targetId = "16540891";
const baseUrl = `wss://chat.mixch.tv/torte/room/`;

members.forEach((v) => connectWs(v));

function connectWs(target) {
    const targetId = target.match(re)[0];
    // console.log(targetId);

    const url = `${baseUrl}${targetId}`;
    const baseDir = `out/final/${targetId}`;
    if (!(fs.existsSync(baseDir))) {
        fs.mkdirSync(baseDir);
    }
    const logfilepath = `${baseDir}/log.json`;
    const itemsfilepath = `${baseDir}/items.json`;
    const rawfilepath = `${baseDir}/raw.json`;
    const ws = new WebSocket(url);
    let prevStatus = {};
    let prevPoint = {};

    const itemCounts = fs.existsSync(itemsfilepath) ? JSON.parse(fs.readFileSync(itemsfilepath, { encoding: "utf-8" })) : {};
    ws.onopen = e => {
        console.log(`接続しました ${url}/live`);
    }
    ws.onmessage = (e) => {
        const receiveTimestamp = new Date(Date.now()).toLocaleString();
        let point = 0;
        const json = {...JSON.parse(e.data), receiveTimestamp };
        if (json.kind == 10 && json.title == undefined) {
            prevStatus = json;
            return;
        }
        fs.appendFileSync(rawfilepath, JSON.stringify(json) + "\n");
        if (prevStatus.kind == 10 && prevStatus.title == undefined) {
            console.error(`${targetId}が配信を始めました ${target}/live`);
        }
        if (json.point && json.point != 0 && prevPoint != json.point) {
            point = json.point - prevPoint || 0;
            prevPoint = json.point;
            console.warn(`${receiveTimestamp}, ${target}/live ,${point}, ${json.point}, ${json.event_point}`);
        }

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
            // console.log(`${receiveTimestamp} new Item: ${json.resource_id} from ${json.name}, total is ${itemCounts[json.resource_id].count}, ${target}/live`);
        }
        if (str != "") {
            fs.appendFileSync(logfilepath, str + "\n");
        }
        prevStatus = json;
    }
}