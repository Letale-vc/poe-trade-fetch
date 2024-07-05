import type { RateStateLimitType } from "../Types/types";

export class RateLimiter {
    state = new Map<string, RateStateLimitType>();

    setRateLimitInfo(key: string, rateLimits: RateStateLimitType): void {
        this.state.set(key, rateLimits);
    }

    canMakeRequest(rateLimitKey: string): boolean {
        return this.getWaitTime(rateLimitKey) === 0;
    }

    private calculateWaitTime(
        limitState: Array<number[]>,
        limit: Array<number[]>,
    ): number {
        return limitState.reduce(
            (acc, [currentHits, maxPeriod, currentLimit], index) => {
                let time = acc;
                const [maxHits] = limit[index];
                const checkViolated = currentHits >= maxHits;

                if (checkViolated && acc < maxPeriod) {
                    time = maxPeriod;
                }

                return time;
            },
            0,
        );
    }

    getWaitTime(rateLimitKey: string): number {
        const rateLimitInfo = this.state.get(rateLimitKey);

        if (rateLimitInfo === undefined) {
            return 0;
        }

        const lastRequestTime = rateLimitInfo.lastResponseTime;
        const differenceTimeInSec = (Date.now() - lastRequestTime) / 1000;
        const accWaitTime = this.calculateWaitTime(
            rateLimitInfo.accountLimitState,
            rateLimitInfo.accountLimit,
        );
        const ipWaitTime = this.calculateWaitTime(
            rateLimitInfo.ipLimitState,
            rateLimitInfo.ipLimit,
        );
        let waitTime = Math.max(accWaitTime, ipWaitTime);
        waitTime = waitTime - differenceTimeInSec;

        return Math.max(0, waitTime);
    }
}
