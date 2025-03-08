# PoE Trade Fetch Documentation

This document provides an in-depth overview of the PoE Trade Fetch library, which you can use to interact with the Path of Exile (PoE) trading API.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [Initialization](#initialization)
  - [Making Requests](#making-requests)
  - [Handling Rate Limits](#handling-rate-limits)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

PoE Trade Fetch is a JavaScript library designed to interact with the PoE in-game trading platform API. It simplifies the process of fetching item data, handling rate limits, and parsing search results in a structured way.

## Features

- **API Integration**: Easily connect to the PoE Trade API.
- **Rate Limit Handling**: Built-in support for managing request delays to avoid rate limiting.
- **Flexible Query**: Customize searches based on item attributes.
- **Multiple Request Types**: Separate methods for initial searches and detailed follow-up requests.

## Prerequisites

- Node.js version 12 or above.
- A valid POESESSID (optional, increases request limit).
- Basic knowledge of JavaScript and asynchronous programming.

## Installation

You can install the package using npm:

```bash
npm install poe-trade-fetch
```

## Usage

### Initialization

First, import the necessary components and initialize the library with your settings:

```javascript
import { 
    LEAGUES_NAMES, 
    REALMS, 
    PoeTradeFetch, 
    RequestBodyType,
    RATE_LIMIT_STATE_KEYS
} from 'poe-trade-fetch';

const poeTradeFetch = PoeTradeFetch.createInstance({
  leagueName: LEAGUES_NAMES.Current,  // Default: 'Standard'
  userAgent: 'My PoE App  your@mail.kek',
  realm: REALMS.pc,                   // Default: pc
  POESESSID: 'Your POESESSID',         // Optional: for increased request rate
});
await poeTradeFetch.update();
```

### Making Requests

#### First Request

Perform an initial search request using your custom query:

```javascript
const RequestBody: RequestBodyType = {
  query: {
    status: { option: 'online' },
    name: 'Prismweave',
    type: 'Rustic Sash',
    stats: [{ type: 'and', filters: [], disabled: false }],
  },
  sort: { price: 'asc' },
};

const { result, id } = await poeTradeFetch.firsRequest(RequestBody);

// Ensure a maximum of 10 identifiers, as PoE API limits the request
const identifiers = result.length > 10 ? result.slice(0, 10) : result;
```

#### Second Request

Fetch detailed trade data for the listed item identifiers:

```javascript
const { result: secondResult } = await poeTradeFetch.secondRequest(identifiers, id);
console.log('Trade Data Items:', secondResult);

// Example: accessing price details
const numberPrice = secondResult[0].listing.price.amount;
const currencyPrice = secondResult[0].listing.price.currency;
```

### Handling Rate Limits

The PoE API enforces rate limits. The library provides delay functionality to manage request timing:

```javascript
// Determine wait time before the first API request
const firstDelay = poeTradeFetch.httpRequest.getWaitTime(RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST);
await poeTradeFetch.httpRequest.delay(firstDelay);

// After the first request, wait before making the second request
const secondDelay = poeTradeFetch.httpRequest.getWaitTime(RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST);
await poeTradeFetch.httpRequest.delay(secondDelay);
```

> **Note:** If you exceed the rate limit, the library will throw an error. Handle exceptions accordingly to ensure robust application behavior.

## API Reference

- **PoeTradeFetch(options)**  
  Initializes the API client. Options include:
  - `leagueName` (default: `LEAGUES_NAMES.Standard`)
  - `userAgent`  
  - `realm` (default: `REALMS.pc`)
  - `POESESSID` (optional)

- **update()**  
  Fetches necessary metadata and updates the internal state.

- **firsRequest(RequestBodyType)**  
  Executes the initial search request. Returns object with:
  - `id`: identifier for the request
  - `result`: list of item identifiers

- **secondRequest(identifiers, id)**  
  Fetches detailed trade information based on identifiers and request ID.

- **httpRequest.getWaitTime(key)**  
  Returns the required delay time for the next request based on the rate limiting key.

## Troubleshooting

- **Rate Limit Errors:**  
  Ensure you implement the proper delay between requests. If you experience rate limiting issues, consider adjusting your request intervals or using a valid POESESSID.

- **Invalid Query Responses:**  
  Double-check your query parameters. Consult the PoE Trade API documentation for valid parameter options.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a branch for your feature or bug fix.
3. Write tests and ensure they pass.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. You can view the full license in the [LICENSE](LICENSE) file.