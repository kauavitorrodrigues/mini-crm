import { describe, expect, it } from "vitest";
import { formatBRL, formatPercent } from "./format";

const norm = (s: string) => s.replace(/\s/g, " ");

describe("format", () => {
    it("formats BRL", () => {
        expect(norm(formatBRL(1234.5))).toBe("R$ 1.234,50");
        expect(norm(formatBRL(0))).toBe("R$ 0,00");
    });

    it("formats conversion rate", () => {
        expect(formatPercent(0)).toBe("0%");
        expect(formatPercent(0.5)).toBe("50%");
        expect(formatPercent(1 / 3)).toBe("33,3%");
        expect(formatPercent(Number.NaN)).toBe("0%");
    });
});
