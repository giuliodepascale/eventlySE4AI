import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "@/auth.config" 
import { db } from "@/lib/db"
import { getUserById } from "@/data/user" 
import NextAuth from "next-auth"
import { UserRole } from "@prisma/client"
import { getAccountByUserId } from "./data/account"
 


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

    if(session.user) {
      session.user.name = token.name ?? '';
      session.user.email = token.email ?? '';
      session.user.isOAuth =  token.isOAuth as boolean;
    }

     return session;
   },
    async jwt({ token }) { //tutto parte da qui, poi il token viene mandato alla sessione
      if (token.sub && token.email?.includes("stripe")) {
        return token;
      }
      if(!token.sub){
      return token;
      }
      const existingUser = await getUserById(token.sub);

      if (!existingUser) {
        return token;
      }

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !!existingAccount;
      token.role = existingUser.role;
      token.name = existingUser.name;
      token.email = existingUser.email;
      

      return token; 
    },
    async authorized({ request }) {
      const { pathname } = request.nextUrl;

      // ✅ Escludi il webhook di Stripe da NextAuth
      if (pathname.startsWith("/api/stripe/webhook")) {
        console.log("✅ Webhook Stripe escluso da NextAuth!");
        return true;
      }

      return false;
    }

  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
})