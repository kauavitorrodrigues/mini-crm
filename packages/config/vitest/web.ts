export const webVitestConfig = {
    test: {
        environment: "jsdom",
        include: ["src/**/*.test.{ts,tsx}"],
        clearMocks: true,
        passWithNoTests: true,
    },
};
