import IoRedis from "ioredis";

export const redis_queue = new IoRedis({
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
    maxRetriesPerRequest: null,
    retryStrategy: function (times: number) {
        return Math.max(Math.min(Math.exp(times), 20000), 1000);
    },
});
