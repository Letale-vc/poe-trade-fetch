// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
const { PoeTradeFetch, RATE_LIMIT_STATE_KEYS, POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST } = require('../dist');

(async () => {
  const api = new PoeTradeFetch({ POESESSID: 'e9d5aa503ac47bf760616495375c0e81' });
  await api.update();
  for (let i = 0; i <= 100; i++) {
    console.log('CYCLE: ', i);
    const firstDelay = api.httpRequest.getWaitTime(POE_API_FIRST_REQUEST);
    console.log(api.httpRequest._requestStatesRateLimitsMap.get(POE_API_FIRST_REQUEST));
    console.log('First delay: ', firstDelay);
    await api.httpRequest.delay(firstDelay);
    const { result, id } = await api.firsRequest({ query: {} });
    // Вибираємо перші 10 ідентифікаторів з результату першого запиту і передаємо їх у другий запит
    const identifiers = result.length > 10 ? result.slice(0, 10) : result;
    const secondDelay = api.httpRequest.getWaitTime(POE_API_SECOND_REQUEST);
    // console.log('Second delay: ', secondDelay);
    await api.httpRequest.delay(secondDelay);
    await api.secondRequest(identifiers, id);
  }
})();
