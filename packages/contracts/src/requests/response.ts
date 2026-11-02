import type { ApiErrorResponse } from "./error";
import type { ApiSuccessResponse } from "./success";

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
