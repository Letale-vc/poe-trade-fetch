import type { RateStateLimitType } from "../Types/types";
import { RateLimiter } from "./RateLimiter";

describe("RateLimiter", () => {
    let rateLimiter: RateLimiter;
    let rateLimitKey: string;
    let rateLimitInfo: RateStateLimitType;

    beforeEach(() => {
        rateLimiter = new RateLimiter();
        rateLimitKey = "testKey";
        rateLimitInfo = {
            lastResponseTime: new Date().getTime(),
            accountLimitState: [[1, 5]],
            accountLimit: [[3, 5]],
            ipLimitState: [[1, 7]],
            ipLimit: [[3, 7]],
        };
    });

    describe("setRateLimitInfo", () => {
        it("should set rate limit info correctly", () => {
            rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
            const result = rateLimiter.getWaitTime(rateLimitKey);
            expect(result).toBeCloseTo(0);
        });
    });

    describe("canMakeRequest", () => {
        it("should return true when getWaitTime returns 0", () => {
            rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
            const result = rateLimiter.isCanMakeRequest(rateLimitKey);
            expect(result).toEqual(true);
        });

        it("should return false when getWaitTime returns a non-zero value", () => {
            rateLimitInfo.lastResponseTime = new Date().getTime() - 1000;
            rateLimitInfo.accountLimitState = [[3, 5]];
            rateLimitInfo.ipLimitState = [[3, 7]];
            rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
            const result = rateLimiter.isCanMakeRequest(rateLimitKey);
            expect(result).toEqual(false);
        });
    });

    describe("getWaitTime", () => {
        it("should return 0 when rateLimitInfo is undefined", () => {
            const result = rateLimiter.getWaitTime(rateLimitKey);
            expect(result).toEqual(0);
        });

        it("should return correct wait time", () => {
            rateLimitInfo.lastResponseTime = new Date().getTime() - 1000;
            rateLimitInfo.accountLimitState = [[3, 5]];
            rateLimitInfo.ipLimitState = [[3, 7]];
            rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
            const result = rateLimiter.getWaitTime(rateLimitKey);
            expect(result).toBeCloseTo(6);
        });
        it("should subtract differenceTimeInSec from waitTime if differenceTimeInSec is less than or equal to waitTime", () => {
            rateLimitInfo.lastResponseTime = Date.now() - 2000;
            rateLimitInfo.accountLimitState = [[3, 5]];
            rateLimitInfo.ipLimitState = [[3, 7]];
            rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
            const result = rateLimiter.getWaitTime(rateLimitKey);
            expect(result).toBeCloseTo(5);
        });
    });
});
