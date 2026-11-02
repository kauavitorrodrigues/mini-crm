import type { FieldPath, FieldValues } from "react-hook-form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    GenericFormField,
    type GenericFormFieldProps,
} from "./GenericFormField";

type SelectFormFieldProps<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
> = Omit<GenericFormFieldProps<TFieldValues, TName>, "render"> & {
    options: { value: string; label: string }[];
    placeholder?: string;
    disabled?: boolean;
};

export function SelectFormField<
    TFieldValues extends FieldValues,
    TName extends FieldPath<TFieldValues>,
>({
    options,
    placeholder,
    disabled,
    ...fieldProps
}: SelectFormFieldProps<TFieldValues, TName>) {
    return (
        <GenericFormField
            {...fieldProps}
            render={(field, fieldState) => (
                <Select
                    items={options}
                    value={field.value || null}
                    onValueChange={(v) => field.onChange(v ?? "")}
                    disabled={disabled}
                >
                    <SelectTrigger
                        id={fieldProps.name}
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                                {o.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}
