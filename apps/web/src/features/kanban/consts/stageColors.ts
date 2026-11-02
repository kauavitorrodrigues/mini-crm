export type StageColor = {
    border: string;
    tint: string;
    dot: string;
};

// Uma cor por etapa, indexada pela ordem (cicla caso haja mais etapas).
export const STAGE_COLORS: StageColor[] = [
    {
        border: "border-t-sky-500",
        tint: "bg-sky-500/[0.06]",
        dot: "bg-sky-500",
    },
    {
        border: "border-t-violet-500",
        tint: "bg-violet-500/[0.06]",
        dot: "bg-violet-500",
    },
    {
        border: "border-t-amber-500",
        tint: "bg-amber-500/[0.07]",
        dot: "bg-amber-500",
    },
    {
        border: "border-t-emerald-500",
        tint: "bg-emerald-500/[0.06]",
        dot: "bg-emerald-500",
    },
];

export const getStageColor = (index: number): StageColor =>
    STAGE_COLORS[index % STAGE_COLORS.length] ?? STAGE_COLORS[0]!;
