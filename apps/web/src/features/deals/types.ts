export type DealStatus = "OPEN" | "WON" | "LOST";

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

export type Note = {
    id: string;
    dealId: string;
    authorId: string;
    author: { id: string; name: string };
    text: string;
    createdAt: string;
};

export type DealFilters = {
    status?: DealStatus;
    stageId?: string;
};

export type DealInput = {
    title: string;
    value: number;
    contactId: string;
    stageId?: string;
};
