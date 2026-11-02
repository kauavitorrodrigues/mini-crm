import type { Queue, QueueOptions, WorkerOptions } from "bullmq";

export type QueueName = string;

export type QueueDefinition = {
    name: QueueName;
    options?: QueueOptions["defaultJobOptions"];
    workerOptions?: Omit<WorkerOptions, "connection">;
};

export type Queues = Record<QueueName, Queue>;
export type QueueConfigs = Record<QueueName, QueueDefinition>;
