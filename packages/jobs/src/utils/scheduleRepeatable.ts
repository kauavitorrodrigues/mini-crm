import type { RepeatOptions } from "bullmq";
import type { jobs } from "../features";
import type { JobPayload } from "../types/job";
import { resolveJob } from "./resolveJob";
import { resolveQueue } from "./resolveQueue";

export async function scheduleRepeatable<J extends keyof typeof jobs>(
    jobName: J,
    schedulerId: string,
    repeatOpts: Omit<RepeatOptions, "key">,
    payload: JobPayload<J>
) {
    const queue = resolveQueue(resolveJob(jobName as string).queue);
    return await queue.upsertJobScheduler(schedulerId, repeatOpts, {
        name: jobName as string,
        data: payload,
    });
}

export async function unscheduleRepeatable<J extends keyof typeof jobs>(
    jobName: J,
    schedulerId: string
) {
    const queue = resolveQueue(resolveJob(jobName as string).queue);
    return await queue.removeJobScheduler(schedulerId);
}
