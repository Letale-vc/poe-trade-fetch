import type { ErrorCodeType } from "./Types/PoeErrorMessage.js";
import { POE_ERROR_CODES } from "./constants.js";

export class PoeTradeError extends Error {
	code: ErrorCodeType | -1;
	status?: number;
	retryAfter?: number;
	details?: unknown;

	constructor(code: ErrorCodeType | -1, message: string, status?: number, retryAfter?: number, details?: unknown) {
		super(message);
		this.code = code;
		this.status = status;
		this.retryAfter = retryAfter;
		this.details = details;
		this.name = "PoeTradeError";
	}

	isRateLimitExceeded(): this is PoeTradeError & { retryAfter: number } {
		return this.code === POE_ERROR_CODES.RateLimitExceeded;
	}
}
