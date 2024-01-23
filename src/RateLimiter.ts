import {RateStateLimitType} from "./Types/types";

export class RateLimiter {
  private requestStatesRateLimitsMap = new Map<string, RateStateLimitType>();

  setRateLimitInfo(key: string, rateLimits: RateStateLimitType) {
    this.requestStatesRateLimitsMap.set(key, rateLimits);
  }

  canMakeRequest(rateLimitKey: string): boolean {
    return this.getWaitTime(rateLimitKey) === 0 ? true : false;
  }

  private stateCheck(limitState: Array<number[]>, limit: Array<number[]>) {
    return limitState.reduce((acc, [current, period], index) => {
      let time = acc;
      const [maxHits] = limit[index];
      const checkViolated = current >= maxHits;
      if (checkViolated && acc < period) {
        time = period;
      }
      return time;
    }, 0);
  }

  getWaitTime(rateLimitKey: string): number {
    const rateLimitInfo = this.requestStatesRateLimitsMap.get(rateLimitKey);
    if (rateLimitInfo === undefined) {
      return 0;
    }
    const dateNow = new Date().getTime();
    const lastRequestTime = rateLimitInfo.lastResponseTime;
    const differenceTimeInSec = (dateNow - (lastRequestTime || dateNow)) / 1000;
    if (differenceTimeInSec === 0) {
      return 0;
    }
    const accWaitTime = this.stateCheck(
      rateLimitInfo.accountLimitState,
      rateLimitInfo.accountLimit,
    );
    const ipWaitTime = this.stateCheck(
      rateLimitInfo.ipLimitState,
      rateLimitInfo.ipLimit,
    );

    let waitTime = Math.max(accWaitTime, ipWaitTime);

    if (differenceTimeInSec <= waitTime) {
      waitTime = waitTime - differenceTimeInSec;
    }

    return waitTime;
  }
}
