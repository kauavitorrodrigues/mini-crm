import { ErrorCodes } from "@mini-crm/contracts";
import { ApiRoutes } from "@mini-crm/routes";
import type {
    ApiErrorResponse,
    ApiResponse,
    ApiSuccessResponse,
} from "@mini-crm/contracts";
import { ApiError } from "@/types/api";
import { queryClient } from "@/lib/tanstack/queryClient";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

// Auth endpoints handle their own 401s (wrong credentials / "am I signed in?").
const AUTH_PATHS = [ApiRoutes.auth.signin.full, ApiRoutes.auth.validate.full];

function handleUnauthorized(path: string) {
    if (AUTH_PATHS.includes(path)) return;
    queryClient.clear();
    if (window.location.pathname !== "/login") {
        window.location.assign("/login");
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...init,
    });

    const body = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
        if (res.status === 401) handleUnauthorized(path);
        const error = body as ApiErrorResponse | null;
        throw new ApiError(
            error?.message ?? "Request failed",
            error?.code ?? ErrorCodes.INTERNAL_SERVER_ERROR,
            res.status
        );
    }

    return (body as ApiSuccessResponse<T> | null)?.data as T;
}

const withBody = (method: string, data?: unknown): RequestInit => ({
    method,
    body: data !== undefined ? JSON.stringify(data) : undefined,
});

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, data?: unknown) =>
        request<T>(path, withBody("POST", data)),
    patch: <T>(path: string, data?: unknown) =>
        request<T>(path, withBody("PATCH", data)),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
