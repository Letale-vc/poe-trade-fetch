// import { POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, PoeTradeFetch } from "../src/index.js";

// (async () => {
// 	const api = PoeTradeFetch.createInstance({ userAgent: "myPoeApp" });
// 	await api.init();

// 	const axiosConfig = {};
// 	for (let i = 0; i <= 5; i++) {
// 		console.log("CYCLE: ", i);
// 		const firstDelay = api.rateLimiter.getWaitTime(POE_API_FIRST_REQUEST);
// 		console.log("First delay: ", firstDelay);
// 		const { result, id } = await api.firsRequest({ query: {} });
// 		const identifiers = result.length > 10 ? result.slice(0, 10) : result;
// 		const secondDelay = api.rateLimiter.getWaitTime(POE_API_SECOND_REQUEST);
// 		console.log("Second delay: ", secondDelay);
// 		await api.secondRequest(identifiers, id, axiosConfig);
// 	}
// })();
