"use client";

import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {RegisterSchema} from "@/schemas"

import { CardWrapper } from "@/components/auth/card-wrapper";
import { Input } from "@/components/ui/input";
import { register } from "@/actions/register";

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
import { useState, useTransition } from "react";

export const RegisterForm = () => {

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof RegisterSchema>>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: "" , 
            email: "",
            password: "" 
            
        }
    });

    const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            register(values)
            .then((data) => {
                setError(data.error);
                setSuccess(data.success);
            })
            .catch(() => {
                
            })
        });
         


    }

    return(
        <CardWrapper 
        headerLabel="Registrati"
        backButtonLabel="Hai già un account?"
        backButtonHref="/auth/login"
        showSocial
        > 
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6">
                    
                    <div className="space-y-4">
                    <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input {...field} 
                                        placeholder="Inserisci il tuo nome"
                                        type="text"
                                        disabled={isPending}/>
                                    </FormControl>
                                  <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit"
                        className="w-full"
                        disabled={isPending}>
                            Registrati
                        </Button>
                    </div>      
                </form>
            </Form> 
        </CardWrapper>
)
}  

export default RegisterForm;