import { jobs } from "../features";
import type { Job } from "../types/job";

// The jobs map starts out empty and only gets typed keys once feature jobs are
// registered, so it is read through a widened view here, the single place
// where that cast lives.
const jobsMap = jobs as Record<string, Job>;

export function resolveJob(jobName: string): Job {
    const job = jobsMap[jobName];

    if (!job) {
        throw new Error(
            `Job "${jobName}" is not registered in features/index.ts`
        );
    }

    return job;
}
