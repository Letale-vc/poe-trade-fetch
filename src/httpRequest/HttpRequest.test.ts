import assert from "node:assert";
import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test";
import MockAdapter from "axios-mock-adapter";
import type { ConfigType, RateStateLimitType } from "../Types/HelperTypes.js";
import {
	DEFAULT_CONFIG,
	POE_API_BASE_URL,
	POE_API_FIRST_REQUEST,
	POE_API_SECOND_REQUEST,
	RATE_LIMIT_STATE_KEYS,
} from "../constants.js";
import type { HttpRequest } from "./HttpRequest.js";

describe("HttpRequest", () => {
	let httpRequest: HttpRequest;
	let mockAxios: MockAdapter;
	let configMock: ConfigType;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	let httpRequestModule: { HttpRequest: any };

	const mockDelay = mock.fn(() => {
		return Promise.resolve();
	});
	const mockDate = 1706059622008;
	const mockDataNow = mock.fn(() => mockDate);

	before(async () => {
		mock.module("../utility/delay.js", {
			namedExports: {
				delay: mockDelay,
			},
		});

		configMock = { ...DEFAULT_CONFIG };
		global.Date.now = mockDataNow;
		httpRequestModule = await import("./HttpRequest.js");
	});

	after(() => {
		mock.restoreAll();
	});

	beforeEach(() => {
		httpRequest = new httpRequestModule.HttpRequest(configMock);
		mockAxios = new MockAdapter(httpRequest.axiosInstance);
	});

	afterEach(() => {
		mockDelay.mock.resetCalls();
		mockAxios.reset();
		mockDataNow.mock.restore();
	});

	it("should create an axios instance with the correct base URL and headers", () => {
		assert.deepEqual(httpRequest.axiosInstance.defaults.headers, {
			"Content-Type": "application/json",
			"User-Agent": "",
			access: "*/*",
			common: {
				Accept: "application/json, text/plain, */*",
				"Content-Type": undefined,
			},
			delete: {},
			get: {},
			head: {},
			patch: {},
			post: {},
			put: {},
		});
		assert.strictEqual(httpRequest.axiosInstance.defaults.baseURL, POE_API_BASE_URL);
	});

	it("should set POESESSID as default", () => {
		configMock.POESESSID = "test-poesessid";
		httpRequest.setPoesessidAsDefault();
		assert.strictEqual(httpRequest.axiosInstance.defaults.headers.common.Cookie, "POESESSID=test-poesessid");
	});

	it("should make a GET request and return the response data", async () => {
		mockAxios.onGet("/test").reply(200, { data: "test" });
		const data = await httpRequest.get("/test");
		assert.deepStrictEqual(data, { data: "test" });
	});

	it("should make a POST request and return the response data", async () => {
		mockAxios.onPost("/test").reply(200, { data: "test" });
		const data = await httpRequest.post("/test", { key: "value" });
		assert.deepStrictEqual(data, { data: "test" });
	});

	it("should get the correct rate limit key", () => {
		const firstRequestKey = httpRequest.getRateLimitKey(POE_API_FIRST_REQUEST);
		const secondRequestKey = httpRequest.getRateLimitKey(POE_API_SECOND_REQUEST);
		const otherKey = httpRequest.getRateLimitKey("/other");
		assert.strictEqual(firstRequestKey, RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST);
		assert.strictEqual(secondRequestKey, RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST);
		assert.strictEqual(otherKey, RATE_LIMIT_STATE_KEYS.OTHER);
	});

	describe("setupResponseInterceptors", () => {
		it("should correctly set rate limit information when response interceptors are set up", async () => {
			const mockResponse = {
				config: { url: "api/trade/search/League" },
				headers: {
					"x-rate-limit-ip": "60:60:60",
					"x-rate-limit-ip-state": "0:60:60",
					"x-rate-limit-account": "45:60:60",
					"x-rate-limit-account-state": "0:60:60",
				},
			};

			const rateLimits: RateStateLimitType = {
				accountLimitState: [[0, 60, 60]],
				ipLimitState: [[0, 60, 60]],
				accountLimit: [[45, 60, 60]],
				ipLimit: [[60, 60, 60]],
				lastResponseTime: Date.now(),
			};

			mockAxios.onAny().reply(200, {}, mockResponse.headers);

			await httpRequest.post("api/trade/search/League");
			const result = httpRequest.rateLimiter.state.get(RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST);
			assert.deepStrictEqual(result, rateLimits);
		});

		it("should handle response without rate limit headers", async () => {
			const mockResponse = {
				config: { url: POE_API_FIRST_REQUEST },
				headers: {},
			};

			const rateLimits: RateStateLimitType = {
				accountLimitState: [],
				ipLimitState: [],
				accountLimit: [],
				ipLimit: [],
				lastResponseTime: Date.now(),
			};
			const setRateLimitInfoMock = mock.fn();
			httpRequest.rateLimiter.setRateLimitInfo = setRateLimitInfoMock;
			mockAxios.onAny().reply(200, {}, mockResponse.headers);
			await httpRequest.post(POE_API_FIRST_REQUEST);
			assert.deepStrictEqual(setRateLimitInfoMock.mock.calls[0].arguments, [
				RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST,
				rateLimits,
			]);
		});
	});

	describe("setupRequestInterceptors", () => {
		it("should delay the request if useRateLimitDelay is true", async () => {
			const mockGetWaitTime = mock.method(httpRequest.rateLimiter, "getWaitTime", () => 1000);
			mockAxios.onGet("/test").reply(200, { data: "test" });
			await httpRequest.get("/test");
			assert.strictEqual(mockGetWaitTime.mock.callCount(), 1);
			assert.strictEqual(mockDelay.mock.callCount(), 1);
		});

		it("should not delay the request if useRateLimitDelay is false", async () => {
			configMock.useRateLimitDelay = false;
			mockAxios.onGet("/test").reply(200, { data: "test" });
			await httpRequest.get("/test");

			assert.strictEqual(mockDelay.mock.callCount(), 0);
		});
	});
});
