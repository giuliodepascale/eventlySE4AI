import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;


// File: /lib/db.ts
interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
  }
  
  // Simulazione di un database in memoria (solo a scopo dimostrativo)
  const fakeDB: Record<string, User> = {};
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export async function findOrCreateUser(googleTokens: any): Promise<User> {
    const idToken = googleTokens.id_token;
    if (!idToken) {
      throw new Error('Token di Google non valido: manca id_token');
    }
  
    // Funzione di decodifica semplificata per l'id_token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function decodeIdToken(token: string): any {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT non valido');
      }
      const payload = parts[1];
      // Decodifica base64 (nota: questo metodo non verifica la firma)
      const decoded = Buffer.from(payload, 'base64').toString('utf8');
      return JSON.parse(decoded);
    }
  
    const decoded = decodeIdToken(idToken);
    const email = decoded.email;
    if (!email) {
      throw new Error('id_token non contiene email');
    }
  
    // Se l'utente esiste già, restituiscilo
    if (fakeDB[email]) {
      return fakeDB[email];
    }
  
    // Altrimenti, crea un nuovo utente
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9), // generazione dummy dell'ID
      email,
      name: decoded.name || '',
      picture: decoded.picture || '',
    };
    fakeDB[email] = newUser;
    return newUser;
  }
  