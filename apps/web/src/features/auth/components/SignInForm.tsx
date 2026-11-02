import { LogInIcon, SparklesIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { SignInSchema, type SignInSchemaType } from "@mini-crm/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
        <Card className="w-full max-w-sm shadow-lg">
            <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>
                    Acesse sua conta para continuar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex w-full flex-col gap-4"
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
                        <LogInIcon aria-hidden />
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
                            <SparklesIcon aria-hidden />
                            Preencher credenciais de demonstração
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
