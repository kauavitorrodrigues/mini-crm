import { ErrorCodes } from "@mini-crm/contracts";
import type {
    ApiErrorResponse,
    ApiResponse,
    ApiSuccessResponse,
} from "@mini-crm/contracts";
import { ApiError } from "@/types/api";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...init,
    });

    const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
        const error = body as ApiErrorResponse | null;
        throw new ApiError(
            error?.message ?? "Request failed",
            error?.code ?? ErrorCodes.INTERNAL_SERVER_ERROR,
            res.status
        );
    }

    return (body as ApiSuccessResponse<T> | null)?.data as T;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, data?: unknown) =>
        request<T>(path, {
            method: "POST",
            body: data !== undefined ? JSON.stringify(data) : undefined,
        }),
};
