import type { JobsOptions } from "bullmq";
import type { jobs } from "../features";
import type { JobPayload } from "../types/job";
import { resolveJob } from "./resolveJob";
import { resolveQueue } from "./resolveQueue";

// The public signatures below stay keyed to `typeof jobs`, so call sites get
// full name/payload inference once feature jobs are registered. Resolving the
// job and its queue by name is delegated to the resolvers, which fail loudly
// when either is missing.
export async function enqueue<J extends keyof typeof jobs>(
    jobName: J,
    payload: JobPayload<J>,
    options?: JobsOptions
) {
    const queue = resolveQueue(resolveJob(jobName as string).queue);
    return await queue.add(jobName as string, payload, options);
}

export async function enqueueBulk<J extends keyof typeof jobs>(
    jobName: J,
    payloads: JobPayload<J>[],
    optionsResolver?: (
        payload: JobPayload<J>,
        index: number
    ) => JobsOptions | undefined
) {
    const queue = resolveQueue(resolveJob(jobName as string).queue);

    return await queue.addBulk(
        payloads.map((payload, index) => ({
            name: jobName as string,
            data: payload,
            opts: optionsResolver?.(payload, index),
        }))
    );
}
