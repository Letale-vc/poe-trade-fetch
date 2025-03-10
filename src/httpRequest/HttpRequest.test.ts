import assert from "node:assert";
import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test";
import MockAdapter from "axios-mock-adapter";
import { LEAGUES_NAMES, POE_API_BASE_URL, REALMS } from "../constants.js";
import type { IConfig } from "../interface/IConfig.js";
import type { HttpRequest } from "./HttpRequest.js";

describe("HttpRequest", () => {
	let httpRequest: HttpRequest;
	let mockAxios: MockAdapter;
	let configMock: IConfig;
	const mockRateLimiter = {
		setRateLimitInfo: mock.fn(),
		getWaitTime: mock.fn(),
		canMakeRequest: mock.fn(),
		getRateLimitKey: mock.fn(),
	};

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
		configMock = {
			leagueName: LEAGUES_NAMES.CURRENT,
			userAgent: "",
			realm: REALMS.PC,
			POESESSID: "",
			useRateLimitDelay: false,
		};
		global.Date.now = mockDataNow;
		httpRequestModule = await import("./HttpRequest.js");
	});

	after(() => {
		mock.restoreAll();
	});

	beforeEach(() => {
		httpRequest = new httpRequestModule.HttpRequest(configMock, mockRateLimiter);
		mockAxios = new MockAdapter(httpRequest.axiosInstance);
	});

	afterEach(() => {
		mockDelay.mock.resetCalls();
		mockAxios.reset();
		mockDataNow.mock.restore();
		mockRateLimiter.setRateLimitInfo.mock.resetCalls();
		mockRateLimiter.getWaitTime.mock.resetCalls();
		mockRateLimiter.canMakeRequest.mock.resetCalls();
		mockRateLimiter.getRateLimitKey.mock.resetCalls();
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

	describe("setupResponseInterceptors", () => {
		it("should correct call setRatelimitInformation", async () => {
			const headers = {
				"x-rate-limit-ip": "60:60:60",
				"x-rate-limit-ip-state": "0:60:60",
				"x-rate-limit-account": "45:60:60",
				"x-rate-limit-account-state": "0:60:60",
			};
			const url = "api/trade/search/League";
			const mockResponse = {
				config: { url: url },
				headers: headers,
			};
			const key = url;
			mock.method(mockRateLimiter, "getRateLimitKey", () => key);
			mockAxios.onAny().reply(200, {}, mockResponse.headers);
			await httpRequest.post(url);
			const actualKey = mockRateLimiter.getRateLimitKey.mock.calls[0].arguments[0];
			const actualHeaders = mockRateLimiter.setRateLimitInfo.mock.calls[0].arguments[1];
			assert.partialDeepStrictEqual(actualHeaders, headers);
			assert.strictEqual(actualKey, key);
		});
	});

	describe("setupRequestInterceptors", () => {
		it("should delay the request if useRateLimitDelay is true", async () => {
			configMock.useRateLimitDelay = true;
			mockAxios.onGet("/test").reply(200, { data: "test" });
			await httpRequest.get("/test");
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
