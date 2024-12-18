"use server"

import { RegisterSchema } from "@/schemas"
import { z } from "zod"

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";


export const register = async (values:z.infer<typeof RegisterSchema>) => {
    const validatedFields = await RegisterSchema.safeParseAsync(values);

    if (!validatedFields.success) {
        return { error: "Campi non validi" };
    }

    const {email, password, name} = validatedFields.data;

    const hashedPassword = await bcrypt.hash(password, 10);

    //CONTROLLO EMAIL GIA' IN USO
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return { error: "Email già in uso" };
    }

    await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });

    //TODO: inviare email di conferma

    return {success : "Utente creato!"}  
}