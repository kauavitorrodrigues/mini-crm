import type { Queue } from "bullmq";
import { queues } from "../queues";
import type { QueueName } from "../types/queue";

export function resolveQueue(queueName: QueueName): Queue {
    const queue = queues[queueName];

    if (!queue) {
        throw new Error(`Queue "${queueName}" is not registered in queues.ts`);
    }

    return queue;
}
