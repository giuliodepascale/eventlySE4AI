"use server"

import { RegisterSchema } from "@/schemas"
import { z } from "zod"


export const register = async (values:z.infer<typeof RegisterSchema>) => {
    const validetedFields = await RegisterSchema.safeParseAsync(values);

    if (!validetedFields.success) {
        return { error: "Campi non validi" };
    }

    return {success : "Email sent"}  
}