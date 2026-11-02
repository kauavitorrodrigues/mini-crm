import type {
    CallHandler,
    ExecutionContext,
    NestInterceptor,
} from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { ApiSuccessResponse } from "@mini-crm/contracts";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
    T,
    ApiSuccessResponse<T> | T
> {
    intercept(
        _context: ExecutionContext,
        next: CallHandler<T>
    ): Observable<ApiSuccessResponse<T> | T> {
        return next
            .handle()
            .pipe(map((data) => (data === undefined ? data : { data })));
    }
}
