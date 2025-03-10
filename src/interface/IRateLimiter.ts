export interface IRateLimiter {
	getWaitTime(key: string): number;
	canMakeRequest(key: string): boolean;
	setRateLimitInfo(key: string, headers: Record<string, unknown>): void;
	getRateLimitKey(url: string | undefined): string;
}
