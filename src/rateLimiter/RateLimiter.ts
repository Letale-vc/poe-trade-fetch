import { POE_API_FIRST_REQUEST, POE_API_SECOND_REQUEST, RATE_LIMIT_STATE_KEYS, type RateLimitKeys } from "../index.js";
import type { IRateLimiter } from "../interface/IRateLimiter.js";

export type RateStateLimitType = {
	[x: string]: number[][] | number;
	accountLimitState: Array<number[]>;
	ipLimitState: Array<number[]>;
	accountLimit: Array<number[]>;
	ipLimit: Array<number[]>;
	lastResponseTime: number;
};

export class RateLimiter implements IRateLimiter {
	state: Map<string, RateStateLimitType>;

	constructor() {
		this.state = new Map<string, RateStateLimitType>();
	}

	setRateLimitInfo(key: string, headers: Record<string, string>): void {
		const rateLimits = this.parseRateLimitHeaders(headers);
		this.state.set(key, rateLimits);
	}

	canMakeRequest(rateLimitKey: string): boolean {
		return this.getWaitTime(rateLimitKey) === 0;
	}

	getRateLimitKey(url: string | undefined): string {
		let key: RateLimitKeys = RATE_LIMIT_STATE_KEYS.OTHER;
		if (!url) return key;
		if (url.includes(POE_API_FIRST_REQUEST.replace("/:realm/:league", ""))) {
			key = RATE_LIMIT_STATE_KEYS.POE_API_FIRST_REQUEST;
		}
		if (url.includes(POE_API_SECOND_REQUEST)) {
			key = RATE_LIMIT_STATE_KEYS.POE_API_SECOND_REQUEST;
		}
		return key;
	}

	private calculateWaitTime(limitState: Array<number[]>, limit: Array<number[]>): number {
		return limitState.reduce((acc, [currentHits, maxPeriod, currentLimit], index) => {
			let time = acc;
			const [maxHits] = limit[index];
			const checkViolated = currentHits >= maxHits;

			if (checkViolated && acc < maxPeriod) {
				time = maxPeriod;
			}

			return time;
		}, 0);
	}
	private parseRateLimitHeaders(headers: Record<string, unknown>): RateStateLimitType {
		const state: RateStateLimitType = {
			accountLimitState: [],
			ipLimitState: [],
			accountLimit: [],
			ipLimit: [],
			lastResponseTime: Date.now(),
		};
		const headerMappings: Record<string, keyof RateStateLimitType> = {
			"x-rate-limit-account-state": "accountLimitState",
			"x-rate-limit-account": "accountLimit",
			"x-rate-limit-ip-state": "ipLimitState",
			"x-rate-limit-ip": "ipLimit",
		};
		for (const [header, mappedHeader] of Object.entries(headerMappings)) {
			const headerValue = headers[header];
			if (typeof headerValue === "string") {
				state[mappedHeader] = this.parseHeaderString(headerValue);
			}
		}
		return state;
	}

	private parseHeaderString(rateLimitString: string): number[][] {
		return rateLimitString.split(",").map((el: string) => el.split(":").map(Number));
	}

	getWaitTime(rateLimitKey: string): number {
		const rateLimitInfo = this.state.get(rateLimitKey);

		if (rateLimitInfo === undefined) {
			return 0;
		}

		const lastRequestTime = rateLimitInfo.lastResponseTime;
		const differenceTimeInSec = (Date.now() - lastRequestTime) / 1000;
		const accWaitTime = this.calculateWaitTime(rateLimitInfo.accountLimitState, rateLimitInfo.accountLimit);
		const ipWaitTime = this.calculateWaitTime(rateLimitInfo.ipLimitState, rateLimitInfo.ipLimit);
		let waitTime = Math.max(accWaitTime, ipWaitTime);
		waitTime = waitTime - differenceTimeInSec;
		return Math.max(0, waitTime);
	}
}
