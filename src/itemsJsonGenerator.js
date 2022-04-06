// const itemJson = require("./index.json").resources;
// const fetch = require("node-fetch");
// import itemJson from "./index.json";
import fetch from "node-fetch";
import fs from "fs";
import { setFlagsFromString } from "v8";

const itemJson = JSON.parse(fs.readFileSync("src/index.json", { encoding: "utf-8" })).resources;

const baseUrl = "https://d2uqarpmf42qy0.cloudfront.net/torte_web_resources";

const items = {};
const itemList = {};
async function main() {
    // const item = itemJson[0];
    for (const item of itemJson) {
        const url = baseUrl + item.file;
        const res = await fetch(url);
        const body = await res.json();
        items[item.id] = body;
        itemList[item.id] = {
            name: body._comment || body.log_name || undefined,
            level: body.level,
            type: body.type,
            preview: baseUrl + body.preview
        }
        console.log(body);
        console.log(itemList[item.id]);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    fs.writeFileSync("out/items.json", JSON.stringify(items));
    fs.writeFileSync("out/itemList.json", JSON.stringify(itemList));
    console.log("[finish]");

}
main();