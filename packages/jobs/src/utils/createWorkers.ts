import { Worker } from "bullmq";
import { redis_queue } from "@mini-crm/infra";
import { queueConfigs } from "../queues";
import { resolveJob } from "./resolveJob";
import { resolveQueue } from "./resolveQueue";

export function createWorkers() {
    const workers: Worker[] = [];

    for (const [queueName, config] of Object.entries(queueConfigs)) {
        const queue = resolveQueue(queueName);

        // An unknown job name fails the job instead of being dropped silently,
        // so it shows up in the "failed" handler below and goes through retries.
        const worker = new Worker(
            queue.name,
            async ({ name, data }) => resolveJob(name).handler(data),
            { connection: redis_queue, ...config.workerOptions }
        );

        worker.on("failed", (job, err) => {
            console.error(`[WORKER] Job ${job?.name} failed:`, {
                jobId: job?.id,
                payload: job?.data,
                error: err.message,
                stack: err.stack,
                attempt: job?.attemptsMade,
                maxAttempts: job?.opts.attempts,
                timestamp: new Date().toISOString(),
            });
        });

        worker.on("error", (err) => {
            console.error(
                `[WORKER] Worker error for queue ${queue.name}:`,
                err
            );
        });

        workers.push(worker);
    }

    return workers;
}
