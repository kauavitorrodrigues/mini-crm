import { Queue } from "bullmq";
import { redis_queue } from "@mini-crm/infra";
import type { QueueDefinition, Queues, QueueConfigs } from "./types/queue";

// Queue definitions from feature folders get spread in here as they're
// added, e.g.: `emailQueue, ...integrationQueues,`
const queueDefs: QueueDefinition[] = [];

export const queueConfigs = Object.fromEntries(
    queueDefs.map((q) => [q.name, q])
) as QueueConfigs;

export const queues = Object.fromEntries(
    queueDefs.map((q) => [
        q.name,
        new Queue(q.name, {
            connection: redis_queue,
            defaultJobOptions: q.options,
        }),
    ])
) as Queues;
