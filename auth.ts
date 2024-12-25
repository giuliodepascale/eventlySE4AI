import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "@/auth.config" 
import { db } from "@/lib/db"
import { getUserById } from "./data/user" 
import NextAuth from "next-auth"
import { UserRole } from "@prisma/client"
 


export const { auth, handlers: { GET, POST }, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/auth/login",    //redirect giusti alle pagine mie e non di nextAuth
    error: "/auth/error",
  },
  events: {
    async linkAccount({user}){
      await db.user.update({
        where: {id: user.id},
        data: { emailVerified: new Date() }
      })
    }
  },
  callbacks: {
  // ACCEDERE SOLO SE HAI VERIFICATO L'EMAIL  
  async signIn({user, account}){

    if(account?.provider!== 'credentials'){
      return true;
    }
    //Per fare il login devi verificare l'email
    const existingUser = await getUserById(user.id!);
    if(!existingUser || !existingUser.emailVerified){
      return false; 
      //TODO: verificare l'email
      
    }
    return true;
  },  //
   async session({ token, session }) {
    //console.log({sessionToken: token})
    if(token.sub && session.user) {
      session.user.id = token.sub;   //quando avremo la sessione avremo anche l'id utente ora
    }

    if(token.role && session.user) {
      session.user.role = token.role as UserRole;
    }
     return session;
   },
    async jwt({ token }) { //tutto parte da qui, poi il token viene mandato alla sessione
      if(!token.sub){
      return token;
      }
      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        return token;
       }

      token.role = existingUser.role;

      return token; 
    },

  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})