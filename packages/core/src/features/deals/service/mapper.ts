import type { Deal, DealStatus } from "@mini-crm/contracts";

type DealQueryRow = {
    id: string;
    title: string;
    value: string;
    contactId: string;
    contactName: string;
    stageId: string;
    status: DealStatus;
    createdAt: Date;
    closedAt: Date | null;
};

export const toDeal = (row: DealQueryRow): Deal => ({
    id: row.id,
    title: row.title,
    value: Number(row.value),
    contactId: row.contactId,
    contact: { id: row.contactId, name: row.contactName },
    stageId: row.stageId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
});
