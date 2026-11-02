import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { SignInSchema, type SignInSchemaType } from "@mini-crm/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/tanstack/queryClient";
import { AUTH_VALIDATE_QUERY_KEY } from "../consts/queryKeys";
import { useSignIn } from "../mutations/signIn";

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;

export function SignInForm() {
    const navigate = useNavigate();
    const signIn = useSignIn();

    const form = useForm<SignInSchemaType>({
        resolver: zodResolver(SignInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: SignInSchemaType) => {
        await signIn.mutateAsync(data, {
            onSuccess: ({ user }) => {
                queryClient.setQueryData(AUTH_VALIDATE_QUERY_KEY, { user });
                navigate({ to: "/" });
            },
            onError: () => form.resetField("password"),
        });
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full max-w-sm flex-col gap-4"
        >
            <TextFormField
                control={form.control}
                name="email"
                label="E-mail"
                required
                type="email"
                disabled={signIn.isPending}
            />
            <TextFormField
                control={form.control}
                name="password"
                label="Senha"
                required
                type="password"
                disabled={signIn.isPending}
            />
            {signIn.isError && (
                <p className="text-sm text-destructive">
                    {signIn.error.message}
                </p>
            )}
            <Button type="submit" disabled={signIn.isPending}>
                Entrar
            </Button>
            {DEMO_EMAIL && DEMO_PASSWORD && (
                <Button
                    type="button"
                    variant="outline"
                    disabled={signIn.isPending}
                    onClick={() => {
                        form.setValue("email", DEMO_EMAIL, {
                            shouldValidate: true,
                        });
                        form.setValue("password", DEMO_PASSWORD, {
                            shouldValidate: true,
                        });
                    }}
                >
                    Preencher credenciais de demonstração
                </Button>
            )}
        </form>
    );
}
