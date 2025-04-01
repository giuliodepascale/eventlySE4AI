"use client";

import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {LoginSchema} from "@/schemas"

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";


import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage

    
} from "@/components/ui/form"
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { login } from "@/actions/login";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";


export const LoginForm = () => {

    const searchParams = useSearchParams();
    
    const callbackUrl = searchParams.get("callbackUrl");
    const router = useRouter();

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""    
        }
    });

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            login(values)
            .then(async (data) => {
                setError(data?.error);
                setSuccess(data?.success);
                if(data?.success) {
                    router.refresh(); // ✅ aggiorna tutta la sessione, triggera useSession e layout
                    router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT); // oppure pusha in seguito // redirect manuale
                }
            });
        });
    }

    return(
        <CardWrapper 
        headerLabel="Accedi"
        backButtonLabel="Non hai un account?"
        backButtonHref="/auth/register"
        > 
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                    
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input {...field} 
                                        placeholder="Inserisci la tua email"
                                        type="email" 
                                        disabled={isPending}/>
                                    </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input {...field} 
                                        placeholder="******"
                                        type="password" 
                                        disabled={isPending}/>
                                    </FormControl>
                                    <Button variant="link" className="px-0 font-normal" asChild size="sm">
                                        <Link href="/auth/reset">Password dimenticata?</Link>
                                    </Button>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit"
                        className="w-full"
                        disabled={isPending}>
                            Login
                        </Button>
                    </div>      
                </form>
            </Form> 
        </CardWrapper>
)
}  

export default LoginForm;