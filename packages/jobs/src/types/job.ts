import type { jobs } from "../features";
import type { QueueName } from "./queue";

export type Job<Payload = unknown> = {
    name: string;
    queue: QueueName;
    handler: (payload: Payload) => Promise<void>;
};

export type JobsMap = typeof jobs;
export type JobKey = keyof JobsMap;
export type JobPayload<K extends JobKey> =
    JobsMap[K] extends Job<infer P> ? P : never;
