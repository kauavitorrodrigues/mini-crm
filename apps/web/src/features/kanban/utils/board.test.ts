import { describe, expect, it } from "vitest";
import type { Deal } from "@/features/deals/types";
import { buildColumns, moveDeal, removeDeal, sumValues } from "./board";

const stages = [
    { id: "s2", name: "Proposta", order: 2 },
    { id: "s1", name: "Lead", order: 1 },
];

const deal = (id: string, stageId: string, value: number): Deal => ({
    id,
    title: `Deal ${id}`,
    value,
    contactId: "c1",
    contact: { id: "c1", name: "Ana" },
    stageId,
    status: "OPEN",
    createdAt: "2026-01-01T00:00:00.000Z",
    closedAt: null,
});

describe("board helpers", () => {
    const deals = [
        deal("a", "s1", 0.1),
        deal("b", "s1", 0.2),
        deal("c", "s2", 50),
    ];

    it("sums values without float drift", () => {
        expect(sumValues(deals.slice(0, 2))).toBe(0.3);
        expect(sumValues([])).toBe(0);
    });

    it("builds ordered columns with count and total", () => {
        const cols = buildColumns(stages, deals);
        expect(cols.map((c) => c.stage.id)).toEqual(["s1", "s2"]);
        expect(cols[0]).toMatchObject({ count: 2, total: 0.3 });
        expect(cols[1]).toMatchObject({ count: 1, total: 50 });
    });

    it("keeps empty columns", () => {
        const cols = buildColumns(stages, []);
        expect(cols.map((c) => c.count)).toEqual([0, 0]);
    });

    it("moves a deal and supports rollback via the previous snapshot", () => {
        const moved = moveDeal(deals, "a", "s2");
        expect(moved.find((d) => d.id === "a")?.stageId).toBe("s2");
        expect(deals.find((d) => d.id === "a")?.stageId).toBe("s1");
        // rollback = restore the snapshot taken in onMutate
        expect(buildColumns(stages, deals)[0]?.count).toBe(2);
    });

    it("is a no-op for same stage or unknown deal", () => {
        expect(moveDeal(deals, "a", "s1")).toBe(deals);
        expect(moveDeal(deals, "zzz", "s2")).toBe(deals);
    });

    it("removes a deal", () => {
        expect(removeDeal(deals, "a").map((d) => d.id)).toEqual(["b", "c"]);
    });
});
