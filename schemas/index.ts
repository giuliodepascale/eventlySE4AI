
import * as z from "zod";


export const LoginSchema = z.object({
    email: z.string().email({
        message: "Inserisci una email valida",
    }),
    password: z.string().min(5,{
        message: "La password è necessaria (almeno 5 caratteri)",
    }).max(20,{
        message: "La password deve avere al massimo 20 caratteri",
    }),
});

export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Inserisci una email valida",
    }).max(50),
    password: z.string().min(5,{
        message: "La password è necessaria (almeno 5 caratteri)",
    }).max(20,{
        message: "La password deve avere al massimo 20 caratteri",
    }),
    name: z.string().min(1, {
        message: "Inserisci il tuo nome",
    }).max(25)
});

export const ResetSchema = z.object({
    email: z.string().email({
        message: "Inserisci una email valida",
    }),
});

export const NewPasswordSchema = z.object({
    password: z.string().min(5,{
        message: "La password è necessaria (almeno 5 caratteri)",
    }).max(20,{
        message: "La password deve avere al massimo 20 caratteri",
    }),
});

export const SettingsSchema = z.object({
    name: z.optional(z.string().min(1).max(25)),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(5).max(20)).or(z.literal('')),
    newPassword: z.optional(z.string().min(5).max(20)).or(z.literal('')),

    
}).refine((data) => {
    if(data.password && !data.newPassword) {
        return false
    }
    return true
}, {
    message: "Devi inserire entrambi i campi per cambiare la password",
    path: ["newPassword"]
}).refine((data) => {
    if(!data.password && data.newPassword) {
        return false
    }
    return true
}, {
    message: "Devi inserire entrambi i campi per cambiare la password",
    path: ["password"]
})