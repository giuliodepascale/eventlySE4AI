"use server"

import { LoginSchema } from "@/schemas"
import { z } from "zod"
import { signIn } from "@/auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { AuthError } from "next-auth"

export const login = async (values: z.infer<typeof LoginSchema>) => {
  // Validate fields
  const validatedFields = await LoginSchema.safeParseAsync(values);
  if (!validatedFields.success) {
    return { error: "Campi non validi" };
  }

  const { email, password } = validatedFields.data;

  // Perform login
  try{
    await signIn("credentials", {
    email,
    password,
    redirectTo: DEFAULT_LOGIN_REDIRECT
  });
}catch(error){
    if(error instanceof AuthError){
        switch(error.type){
            case "CredentialsSignin":
                return { error: "Credenziali non valide" };
            default:    
                return { error: "Errore di autenticazione" };
        }
    }
    throw error;
 }

};
