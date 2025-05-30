"use client";

import {useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {ResetSchema} from "@/schemas"

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
import { reset } from "@/actions/reset";
import { useState, useTransition } from "react";


export const ResetForm = () => {

  

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: ""  
        }
    });

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {
        setError("");
        setSuccess("");

        startTransition(() => {
            reset(values)
            .then((data: { error?: string; success?: string }) => {
                setError(data?.error);
                setSuccess(data?.success);
            });
        }); 
    }

    return(
        <CardWrapper 
        headerLabel="Password dimenticata?"
        backButtonLabel="Torna al login"
        backButtonHref="/auth/login"
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
                      
                        <FormError message={error}/>
                        <FormSuccess message={success}/>
                        <Button type="submit"
                        className="w-full"
                        disabled={isPending}>
                            Invia email di recupero
                        </Button>
                    </div>      
                </form>
            </Form> 
        </CardWrapper>
)
}  

export default ResetForm;