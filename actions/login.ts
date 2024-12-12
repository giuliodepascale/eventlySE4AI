"use server"

import { LoginSchema } from "@/schemas"
import { z } from "zod"


export const login = async (values:z.infer<typeof LoginSchema>) => {
    const validetedFields = await LoginSchema.safeParseAsync(values);

    if (!validetedFields.success) {
        return { error: "Campi non validi" };
    }

    return {success : "Email sent"}  
}