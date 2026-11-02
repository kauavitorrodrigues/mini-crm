import { createWorkers } from "@mini-crm/jobs";
import { redis_queue } from "@mini-crm/infra";

const workers = createWorkers();
console.log("[WORKER] - Worker is running and processing jobs");

async function gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n[WORKER] - Received ${signal}, shutting down gracefully...`);

    await Promise.all(workers.map((worker) => worker.close()));
    await redis_queue.quit();

    console.log("[WORKER] - All workers closed successfully");
    process.exit(0);
}

process.on("SIGINT", () => void gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => void gracefulShutdown("SIGTERM"));
