import fs from "fs";
import path from "path";


const itemTable = JSON.parse(fs.readFileSync("src/itemList.json"));
const logs = fs.readFileSync(process.argv[2], { encoding: "utf-8" }).split("\n");


let str = "時間,ユーザーID,アイテムID, ユーザー名, カテゴリ, アイテム名, アイテム個数, pt（たまに違う）,アイテム画像\n";

for (let i = 0; i < logs.length; i += 1) {
    const log = JSON.parse(logs[i]);
    switch (log.kind) {
        case 45:
        case 46:
        case 48:
        case 53:
            let item = itemTable[log.resource_id];

            str += `${log.created}, ${log.user_id},${log.resource_id},${log.name},${getCategory(item.type)};
                if(item.name){
                  str
                }
                ${path.basename(item.preview)},${log.count},-1,${item.preview}\n`;
            str += `${log.created}, ${log.user_id},${log.resource_id},${log.name},${getCategory(item.type)},${path.basename(item.preview)},${log.count},${item.level},${item.preview}\n`;
            str += `${log.created}, ${log.user_id},${log.resource_id},${log.name},${getCategory(item.type)},${item.name},${log.count},${item.level},${item.preview}\n`;
            break;
        default:
            break;
    }
}
fs.writeFileSync("itemLog.csv", str);

function getCategory(type) {
    switch (type) {
        case 1:
            return "スパコメ";
        case 2:
            return "ポイポイ";
        case 3:
            return "スタンプ";
        case 6:
            return "アイテム";
        default:
            return "その他";
    }
}