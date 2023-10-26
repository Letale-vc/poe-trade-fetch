import {
  POE_API_FIRST_REQUEST,
  POE_API_SECOND_REQUEST,
  PoeTradeFetch,
} from "../dist/esm/index.js";

(async () => {
  const api = new PoeTradeFetch();
  await api.update();
  for (let i = 0; i <= 10; i++) {
    console.log("CYCLE: ", i);
    console.log(api.httpRequest.requestStatesRateLimitsMap);
    const firstDelay = api.httpRequest.getWaitTime(POE_API_FIRST_REQUEST);
    console.log("First delay: ", firstDelay);
    await api.httpRequest.delay(firstDelay);
    const {result, id} = await api.firsRequest({query: {}});
    const identifiers = result.length > 10 ? result.slice(0, 10) : result;
    const secondDelay = api.httpRequest.getWaitTime(POE_API_SECOND_REQUEST);
    console.log("Second delay: ", secondDelay);
    await api.httpRequest.delay(secondDelay);
    await api.secondRequest(identifiers, id);
  }
})();
