import type { DealStatus } from "./deal-status";

export type Deal = {
    id: string;
    title: string;
    value: number;
    contactId: string;
    contact: { id: string; name: string };
    stageId: string;
    status: DealStatus;
    createdAt: string;
    closedAt: string | null;
};
