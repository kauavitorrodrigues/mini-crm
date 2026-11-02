import type { DealStatus } from "../types";

export const STATUS_LABEL: Record<DealStatus, string> = {
    OPEN: "Aberto",
    WON: "Ganho",
    LOST: "Perdido",
};

export const STATUS_FILTERS = [
    { value: "ALL", label: "Todos" },
    { value: "OPEN", label: "Abertos" },
    { value: "WON", label: "Ganhos" },
    { value: "LOST", label: "Perdidos" },
] as const;
