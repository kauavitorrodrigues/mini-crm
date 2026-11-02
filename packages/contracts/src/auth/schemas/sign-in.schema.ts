import { z } from "zod";
import { AuthErrorMessages } from "./consts/error-messages";

export const SignInSchema = z.object({
    email: z
        .string({ error: AuthErrorMessages.email.required })
        .nonempty({ error: AuthErrorMessages.email.required })
        .email({ error: AuthErrorMessages.email.invalid }),
    password: z
        .string({ error: AuthErrorMessages.password.required })
        .nonempty({ error: AuthErrorMessages.password.required }),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;
