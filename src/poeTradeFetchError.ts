import { type AxiosError, isAxiosError } from "axios";
import type {
    ErrorCodesType,
    ErrorMessagesType,
    PoeError,
} from "./Types/PoeErrorMessage.js";

export class PoeTradeFetchError extends Error {
    public axiosError: AxiosError | undefined;
    public isAxiosError = false;
    public isPoeApiError = false;
    public poeTradeApiErrorCode: ErrorCodesType | undefined;
    public poeTradeApiErrorMessage: ErrorMessagesType | undefined;
    constructor(error: unknown) {
        super();
        if (isAxiosError<PoeError>(error)) {
            this.message = error.message;
            this.isAxiosError = true;
            this.axiosError = error;
            if (error.response) {
                if (error.response.data.error) {
                    this.isPoeApiError = true;
                    this.poeTradeApiErrorCode = error.response.data.error.code;
                    this.poeTradeApiErrorMessage =
                        error.response.data.error.message;
                }
            }
        } else if (error instanceof Error) {
            this.message = error.message;
        }
    }
}
