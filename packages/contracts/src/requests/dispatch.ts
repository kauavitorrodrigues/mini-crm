import type { ApiErrorResponse } from "./error";
import type { ApiSuccessResponse } from "./success";

export type DispatchResponse<T> =
    | ({ ok: true } & ApiSuccessResponse<T>)
    | ({ ok: false; status: number } & ApiErrorResponse);
