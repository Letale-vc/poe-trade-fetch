import { isAxiosError } from "axios";
import type { ErrorCodesType, ErrorMessagesType, PoeError } from "./Types/PoeErrorMessage.js";

export class PoeTradeFetchError extends Error {
	public originalError: unknown;
	public isAxiosError = false;
	public isPoeApiError = false;
	public poeTradeApiErrorCode: ErrorCodesType | undefined;
	public poeTradeApiErrorMessage: ErrorMessagesType | undefined;
	constructor(error: unknown) {
		super();
		this.originalError = error;
		if (isAxiosError<PoeError>(error)) {
			this.message = error.message;
			this.isAxiosError = true;
			if (error.response?.data.error) {
				this.isPoeApiError = true;
				this.poeTradeApiErrorCode = error.response.data.error.code;
				this.poeTradeApiErrorMessage = error.response.data.error.message;
			}
		} else if (error instanceof Error) {
			this.message = error.message;
		} else {
			this.message = "Unknown error";
		}
	}
}
