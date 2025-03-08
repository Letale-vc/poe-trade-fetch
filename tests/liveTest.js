import { POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, PoeTradeFetch } from "../dist/esm/index.js";

(async () => {
	const api = new PoeTradeFetch({ userAgent: "myPoeApp" });
	await api.init();
	// const httpAgent = new HttpProxyAgent("");
	// const httpsAgent = new HttpsProxyAgent("");

	const axiosConfig = {};
	for (let i = 0; i <= 5; i++) {
		console.log("CYCLE: ", i);
		console.log(api.httpRequest.rateLimiter.rateLimitsState);
		const firstDelay = api.httpRequest.rateLimiter.getWaitTime(POE_API_FIRST_REQUEST);
		console.log("First delay: ", firstDelay);
		const { result, id } = await api.firsRequest({ query: {} });
		console.log(api.httpRequest.rateLimiter.rateLimitsState.get(POE_API_FIRST_REQUEST));
		const identifiers = result.length > 10 ? result.slice(0, 10) : result;
		const secondDelay = api.httpRequest.rateLimiter.getWaitTime(POE_API_SECOND_REQUEST);
		console.log("Second delay: ", secondDelay);
		await api.secondRequest(identifiers, id, axiosConfig);
	}
})();
