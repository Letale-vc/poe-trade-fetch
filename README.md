# PoE Trade Fetch

PoE Trade Fetch is a JavaScript library for interacting with the "Path of Exile" (PoE) in-game trading platform API. It allows you to retrieve item information and facilitate trade within the game.

## Key Features

- Search for items on the PoE trade platform.

## Installation

You can install PoE Trade Fetch via npm:

```bash
npm install poe-trade-fetch
```

## Usage

```javascript
import { PoeTradeFetch,LEAGUES_NAMES } from 'poe-trade-fetch';

(async () => {
  // Create a PoeTradeFetch instance
  const poeTradeFetch = new PoeTradeFetch({
    leagueName: LEAGUES_NAMES.Current, // League name (default is 'Standard')
    userAgent: 'My PoE App  your@mail.kek',
    realm: REALMS.pc, // Realm (default is pc)
  });
  await poeTradeFetch.update();

  // Use the API to fetch data (example)
  const tradeUrl = new URL('https://www.pathofexile.com/trade/search/Ancestor/EGmMQEKS5');
  const tradeDataItems = await poeTradeFetch.poeTradeSearchUrl(tradeUrl, 'Your POESESSID');
  console.log('Trade Data Items:', tradeDataItems.result);
})();
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
