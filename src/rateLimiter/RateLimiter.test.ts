import assert from "node:assert/strict";
import { beforeEach, describe, it, test } from "node:test";
import { POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, RATE_LIMIT_STATE_KEYS } from "../constants.js";
import { RateLimiter, type RateStateLimitType } from "./RateLimiter.js";

describe("RateLimiter", () => {
	let rateLimiter: RateLimiter;
	let rateLimitKey: string;

	beforeEach(() => {
		rateLimiter = new RateLimiter();
		rateLimitKey = "testKey";
	});

	it("should get the correct rate limit key", () => {
		const firstRequestKey = rateLimiter.getRateLimitKey(POE_API_FIRST_REQUEST);
		const secondRequestKey = rateLimiter.getRateLimitKey(POE_API_SECOND_REQUEST);
		const otherKey = rateLimiter.getRateLimitKey("/other");
		assert.strictEqual(firstRequestKey, RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST);
		assert.strictEqual(secondRequestKey, RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST);
		assert.strictEqual(otherKey, RATE_LIMIT_STATE_KEYS.OTHER);
	});

	it("should correctly set rate limit information", async () => {
		const headers = {
			"x-rate-limit-ip": "60:60:60",
			"x-rate-limit-ip-state": "0:60:60",
			"x-rate-limit-account": "45:60:60",
			"x-rate-limit-account-state": "0:60:60",
		};

		const rateLimits: RateStateLimitType = {
			accountLimitState: [[0, 60, 60]],
			ipLimitState: [[0, 60, 60]],
			accountLimit: [[45, 60, 60]],
			ipLimit: [[60, 60, 60]],
			lastResponseTime: Date.now(),
		};

		rateLimiter.setRateLimitInfo(RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST, headers);
		const state = rateLimiter.state.get(RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST);
		if (!state) {
			assert.fail("state is undefined");
		}
		assert.deepStrictEqual(state, rateLimits);
	});

	describe("setRateLimitInfo", () => {
		test("should set rate limit info correctly", () => {
			const headers = {
				"x-rate-limit-ip": "3:7",
				"x-rate-limit-ip-state": "1:7",
				"x-rate-limit-account": "3:5",
				"x-rate-limit-account-state": "1:5",
			};
			rateLimiter.setRateLimitInfo(rateLimitKey, headers);
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 0);
		});
	});

	describe("canMakeRequest", () => {
		test("should return true when getWaitTime returns 0", () => {
			const headers = {
				"x-rate-limit-ip": "3:7",
				"x-rate-limit-ip-state": "1:7",
				"x-rate-limit-account": "3:5",
				"x-rate-limit-account-state": "1:5",
			};
			rateLimiter.setRateLimitInfo(rateLimitKey, headers);
			const result = rateLimiter.canMakeRequest(rateLimitKey);
			assert.strictEqual(result, true);
		});

		test("should return false when getWaitTime returns a non-zero value", () => {
			const headers = {
				"x-rate-limit-ip": "3:7",
				"x-rate-limit-ip-state": "3:7",
				"x-rate-limit-account": "3:5",
				"x-rate-limit-account-state": "3:5",
			};

			rateLimiter.setRateLimitInfo(rateLimitKey, headers);

			const state = rateLimiter.state.get(rateLimitKey);
			if (!state) {
				assert.fail("state is undefined");
			}
			state.lastResponseTime = new Date().getTime() - 1000;
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
			const headers = {
				"x-rate-limit-ip": "3:7",
				"x-rate-limit-ip-state": "3:7",
				"x-rate-limit-account": "3:5",
				"x-rate-limit-account-state": "3:5",
			};

			rateLimiter.setRateLimitInfo(rateLimitKey, headers);
			const state = rateLimiter.state.get(rateLimitKey);
			if (!state) {
				assert.fail("state is undefined");
			}
			state.lastResponseTime = new Date().getTime() - 1000;
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 6);
		});
		test("should subtract differenceTimeInSec from waitTime if differenceTimeInSec is less than or equal to waitTime", () => {
			const headers = {
				"x-rate-limit-ip": "3:7",
				"x-rate-limit-ip-state": "3:7",
				"x-rate-limit-account": "3:5",
				"x-rate-limit-account-state": "3:5",
			};
			rateLimiter.setRateLimitInfo(rateLimitKey, headers);
			const state = rateLimiter.state.get(rateLimitKey);
			if (!state) {
				assert.fail("state is undefined");
			}
			state.lastResponseTime = new Date().getTime() - 2000;
			const result = rateLimiter.getWaitTime(rateLimitKey);
			assert.strictEqual(result, 5);
		});
	});
});
