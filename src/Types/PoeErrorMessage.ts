import type { POE_ERROR_CODES } from "../constants.js";

export type PoeError = {
	error: {
		code: ErrorCodeType;
		message: ErrorMessageType;
	};
};

export type ErrorMessageType = keyof typeof POE_ERROR_CODES;
export type ErrorCodeType = (typeof POE_ERROR_CODES)[keyof typeof POE_ERROR_CODES];
