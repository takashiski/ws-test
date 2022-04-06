import got from "got";
import axios from "axios";
import path from "path";
import fs from "fs";
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

function getUrl(url) {
    return `https://mixch.tv/api-web/users/${url}/fans/ranking/event?event_id=8724`;
    // return `https://mixch.tv/api-web/users/${path.basename(url)}/fans/ranking/event?event_id=8724`;
}

async function main() {
    let str = "";
    const rankingRes = await axios.get("https://mixch.tv/api-web/live/events/8724");
    const arr = rankingRes.data.users.map((v, i) => { return { rank: i, "score": v.score, "id": v.id, "name": v.name }; });
    for (let i = 0; i < arr.length; i += 1) {
        const c = arr[i];
        str += `${c.rank}, ${c.score}, ${c.id}, ${c.name},`;
        const res = await axios.get(getUrl(c.id));
        str += res.data.ranking.map(v => v.score).join(",");
        str += "\n";
    }
    fs.writeFileSync("./ptRanking.csv", str);
    // fs.writeFileSync("./ptRanking.json", JSON.stringify(rankings));
}

main();