type RouteParams<S extends string> =
    S extends `${string}/:${infer Param}/${infer Rest}`
        ? { [k in Param | keyof RouteParams<`/${Rest}`>]: string | number }
        : S extends `${string}/:${infer Param}`
          ? { [k in Param]: string | number }
          : {};

export function buildApiRoute<S extends string>(
    route: S,
    params: RouteParams<S>
): string {
    return route.replace(/:([a-zA-Z]+)/g, (_, key) => {
        if (!(key in params)) throw new Error(`Missing param "${key}"`);
        return String(params[key as keyof typeof params]);
    });
}
