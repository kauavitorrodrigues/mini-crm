const brl = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const percent = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
});

export const formatBRL = (value: number) => brl.format(value);

/** `rate` is a 0..1 ratio. */
export const formatPercent = (rate: number) =>
    percent.format(Number.isFinite(rate) ? rate : 0);
