import { POE_ERROR_CODES } from "../constants";

export interface PoeErrorMessage {
    error: {
        code: ErrorCodesType;
        message: ErrorMessagesType;
    };
}

export type ErrorCodesType = keyof typeof POE_ERROR_CODES;
export type ErrorMessagesType =
    (typeof POE_ERROR_CODES)[keyof typeof POE_ERROR_CODES];
