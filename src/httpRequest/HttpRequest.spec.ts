import MockAdapter from "axios-mock-adapter";
import type { RateStateLimitType } from "../Types/index.js";
import {
    DEFAULT_CONFIG,
    POE_API_BASE_URL,
    POE_API_FIRST_REQUEST,
    POE_API_SECOND_REQUEST,
    RATE_LIMIT_STATE_KEYS,
} from "../constants.js";
import { delay } from "../utility/delay.js";
import { HttpRequest } from "./HttpRequest.js";

jest.mock("../utility/delay.js", () => ({
    delay: jest.fn().mockImplementation(() => Promise.resolve()),
}));

describe("HttpRequest", () => {
    let httpRequest: HttpRequest;
    let mockAxios: MockAdapter;

    beforeEach(() => {
        const mockDate = 1706059622008;
        global.Date.now = jest.fn(() => mockDate);
        httpRequest = new HttpRequest(DEFAULT_CONFIG);
        mockAxios = new MockAdapter(httpRequest.axiosInstance);
    });

    afterEach(() => {
        mockAxios.reset();
        (global.Date.now as unknown as jest.SpyInstance).mockRestore();
    });

    test("should create an axios instance with the correct base URL and headers", () => {
        expect(httpRequest.axiosInstance.defaults.baseURL).toBe(
            POE_API_BASE_URL,
        );
        expect(httpRequest.axiosInstance.defaults.headers).toEqual({
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
    });

    test("should set POESESSID as default", () => {
        httpRequest.setPoesessidAsDefault("test-poesessid");
        expect(httpRequest.axiosInstance.defaults.headers.common.Cookie).toBe(
            "POESESSID=test-poesessid",
        );
    });

    test("should make a GET request and return the response data", async () => {
        mockAxios.onGet("/test").reply(200, { data: "test" });
        const data = await httpRequest.get("/test");
        expect(data).toEqual({ data: "test" });
    });

    test("should make a POST request and return the response data", async () => {
        mockAxios.onPost("/test").reply(200, { data: "test" });
        const data = await httpRequest.post("/test", { key: "value" });

        expect(data).toEqual({ data: "test" });
    });

    test("should get the correct rate limit key", () => {
        const firstRequestKey = httpRequest.getRateLimitKey(
            POE_API_FIRST_REQUEST,
        );
        const secondRequestKey = httpRequest.getRateLimitKey(
            POE_API_SECOND_REQUEST,
        );
        const otherKey = httpRequest.getRateLimitKey("/other");

        expect(firstRequestKey).toBe(
            RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST,
        );
        expect(secondRequestKey).toBe(
            RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST,
        );
        expect(otherKey).toBe(RATE_LIMIT_STATE_KEYS.OTHER);
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

            expect(
                httpRequest.rateLimiter.state.get(
                    RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST,
                ),
            ).toEqual(rateLimits);
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

            jest.spyOn(httpRequest.rateLimiter, "setRateLimitInfo");

            mockAxios.onAny().reply(200, {}, mockResponse.headers);

            await httpRequest.post(POE_API_FIRST_REQUEST);
            expect(
                httpRequest.rateLimiter.setRateLimitInfo,
            ).toHaveBeenCalledWith(
                RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST,
                rateLimits,
            );
        });
    });

    describe("setupRequestInterceptors", () => {
        it("should delay the request if useRateLimitDelay is true", async () => {
            const delaySpy = jest.spyOn({ delay }, "delay");
            httpRequest.useRateLimitDelay = true;
            httpRequest.rateLimiter.getWaitTime = jest
                .fn()
                .mockReturnValue(1000);
            httpRequest.rateLimiter.canMakeRequest = jest
                .fn()
                .mockReturnValue(true);
            mockAxios.onGet("/test").reply(200, { data: "test" });
            await httpRequest.get("/test");

            expect(delaySpy).toHaveBeenCalledWith(1000);
        });

        it("should not delay the request if useRateLimitDelay is false", async () => {
            const delaySpy = jest.spyOn({ delay }, "delay");
            httpRequest.useRateLimitDelay = false;

            mockAxios.onGet("/test").reply(200, { data: "test" });
            await httpRequest.get("/test");

            expect(delaySpy).not.toHaveBeenCalled();
        });

        it("should throw an error if the rate limit is exceeded", async () => {
            httpRequest.rateLimiter.canMakeRequest = jest
                .fn()
                .mockReturnValue(false);

            mockAxios.onGet("/test").reply(200, { data: "test" });
            await expect(httpRequest.get("/test")).rejects.toThrow(
                "Rate limit exceeded",
            );
        });

        it("should not throw an error if the rate limit is not exceeded", async () => {
            httpRequest.rateLimiter.canMakeRequest = jest
                .fn()
                .mockReturnValue(true);

            mockAxios.onGet("/test").reply(200, { data: "test" });
            await expect(httpRequest.get("/test")).resolves.not.toThrow();
        });
    });
});
