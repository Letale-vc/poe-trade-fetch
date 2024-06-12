import {
    LEAGUES_NAMES,
    PoeTradeFetch,
    RATE_LIMIT_STATE_KEYS,
    REALMS,
    type RequestBodyType,
} from "../src/index.js";
import { delay } from "../src/utility/delay.js";

const poeTradeFetch = new PoeTradeFetch({
    leagueName: LEAGUES_NAMES.Current, // League name (default is 'Standard')
    userAgent: "My PoE App  your@mail.kek",
    realm: REALMS.pc, // Realm (default is pc)
});
await poeTradeFetch.init();

// Use the API to fetch data (example)
const tradeUrl = new URL(
    "https://www.pathofexile.com/trade/search/Ancestor/EGmMQEKS5",
);
const tradeDataItems = await poeTradeFetch.poeTradeSearchUrl(
    tradeUrl,
    "Your POESESSID",
);
console.log("Trade Data Items:", tradeDataItems.result);

// Another example
// I create a delay before the call, if you don't do the delay after a few requests you will get a RateLimit from the PoE API.
// My solution takes this into account, and if you have exceeded the limit,
// then poeTradeFetch will not issue the request and will simply throw this error: throw new Error('Rate limit exceeded');.
// So the request will not be made and you will not receive any restrictions on poe trade.
// Please note that if your IP address is being used by concurrent requests, you may still experience rate throttling.
// You can also set  POESESSID, this will increase the number of requests per minute.
// You also need to understand that different rate limits are possible for different API urls

await poeTradeFetch.updateConfig({
    leagueName: LEAGUES_NAMES.Current, // default Standard
    userAgent: "My PoE App  your@mail.kek",
    realm: REALMS.pc, // if need default pc
    POESESSID: "Your POESESSID", // if need
});

const firstDelay = poeTradeFetch.httpRequest.rateLimiter.getWaitTime(
    RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST,
);
await delay(firstDelay);

const RequestBody: RequestBodyType = {
    query: {
        status: { option: "online" },
        name: "Prismweave",
        type: "Rustic Sash",
        stats: [{ type: "and", filters: [], disabled: false }],
    },
    sort: { price: "asc" },
}; // just create you any query

const { result, id } = await poeTradeFetch.firsRequest(RequestBody);
// You take something like this response
// {
// 	"id": "prX3f0",
// 	"complexity": 6,
// 	"result": [
// 		"9b09e2b621794cd73804a1c27c3ab817b8d6467efdac1ec406944ca47c0324e7",
// 		"7015ff5aad7940c0ca3b5ff76d1444c9ae3321ac3f7944a3ee5eedcf8349beba",
//      ...  another ids
// 	],
// 	"total": 2053
// }
// if you give more than 10 IDs, the PoE API will give an error
const identifiers = result.length > 10 ? result.slice(0, 10) : result;

const secondDelay = poeTradeFetch.httpRequest.rateLimiter.getWaitTime(
    RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST,
);
await delay(secondDelay);

// here you get information about 10 listings on poe trade
const { result: secondResult } = await poeTradeFetch.secondRequest(
    identifiers,
    id,
);
console.log("Trade Data Items:", secondResult);
console.log(
    "price: ",
    secondResult[0].listing.price.amount,
    secondResult[0].listing.price.currency,
);
