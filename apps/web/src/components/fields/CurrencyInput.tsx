import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/format";

type CurrencyInputProps = {
    id?: string;
    value: number | undefined;
    onChange: (value: number) => void;
    disabled?: boolean;
    "aria-invalid"?: boolean;
};

/** Digit-by-digit BRL mask: typing "12345" yields R$ 123,45. */
export function CurrencyInput({
    value,
    onChange,
    ...props
}: CurrencyInputProps) {
    return (
        <Input
            {...props}
            inputMode="numeric"
            autoComplete="off"
            value={formatBRL(value ?? 0)}
            onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                onChange(Number(digits || "0") / 100);
            }}
        />
    );
}
