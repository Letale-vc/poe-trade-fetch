import type { AxiosInstance, AxiosRequestConfig } from "axios";

export interface IHttpRequest {
    axiosInstance: AxiosInstance;
    updateConfiguration(): void
    get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
    post<T>(url: string, data?: object, config?: AxiosRequestConfig,): Promise<T>
}