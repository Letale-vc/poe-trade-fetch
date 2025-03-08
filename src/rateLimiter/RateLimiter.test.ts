import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";
import type { RateStateLimitType } from "../Types/HelperTypes.js";
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
		test("should set rate limit info correctly", () => {
			rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 0);
		});
	});

	describe("canMakeRequest", () => {
		test("should return true when getWaitTime returns 0", () => {
			rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
			const result = rateLimiter.canMakeRequest(rateLimitKey);
			assert.strictEqual(result, true);
		});

		test("should return false when getWaitTime returns a non-zero value", () => {
			rateLimitInfo.lastResponseTime = new Date().getTime() - 1000;
			rateLimitInfo.accountLimitState = [[3, 5]];
			rateLimitInfo.ipLimitState = [[3, 7]];
			rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
			const result = rateLimiter.canMakeRequest(rateLimitKey);
			assert.strictEqual(result, false);
		});
	});

	describe("getWaitTime", () => {
		test("should return 0 when rateLimitInfo is undefined", () => {
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 0);
		});

		test("should return correct wait time", () => {
			rateLimitInfo.lastResponseTime = new Date().getTime() - 1000;
			rateLimitInfo.accountLimitState = [[3, 5]];
			rateLimitInfo.ipLimitState = [[3, 7]];
			rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 6);
		});
		test("should subtract differenceTimeInSec from waitTime if differenceTimeInSec is less than or equal to waitTime", () => {
			rateLimitInfo.lastResponseTime = Date.now() - 2000;
			rateLimitInfo.accountLimitState = [[3, 5]];
			rateLimitInfo.ipLimitState = [[3, 7]];
			rateLimiter.setRateLimitInfo(rateLimitKey, rateLimitInfo);
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 5);
		});
	});
});
