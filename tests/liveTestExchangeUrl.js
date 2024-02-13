import { PoeTradeFetch } from "../dist/PoeTradeFetch.js";

(async function () {
  const api = PoeTradeFetch.getInstance({POESESSID: process.env.POESESSID});
  await api.update();

  console.log(
    await api.fetchExchangeUrl(
      new URL("https://www.pathofexile.com/trade/exchange/Ancestor/VMn7Bedfp"),
    ),
  );
  await api.update({POESESSID: ""});
  console.log(
    await api.fetchExchangeUrl(
      new URL("https://www.pathofexile.com/trade/exchange/Ancestor/VMn7Bedfp"),
    ),
  );
})();
