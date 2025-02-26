import Stripe from "stripe";
import { db } from "./db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function updateOrganizationTicketingStatus(organizationId: string, status: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) throw new Error("Organizzazione non trovata.");
  if (!organization.stripeAccountId) {
    await db.organization.update({
      where: { id: organizationId },
      data: { ticketingStatus: "no_stripe" },
    });
    return "no_stripe";
  }

  // Aggiorna lo stato nel database con il valore ricevuto dal webhook
  await db.organization.update({
    where: { id: organizationId },
    data: { ticketingStatus: status },
  });

  console.log(`✅ Stato aggiornato per ${organizationId}: ${status}`);
  return status;
}
