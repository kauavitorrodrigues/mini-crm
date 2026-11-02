export const getErrorMessage = (
    error: unknown,
    fallback = "Algo deu errado. Tente novamente."
) => (error instanceof Error && error.message ? error.message : fallback);
