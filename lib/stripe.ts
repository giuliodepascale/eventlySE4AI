import Stripe from "stripe";
import { db } from "./db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function updateOrganizationTicketingStatus(organizationId: string) {
  const organization = await db.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) throw new Error("Organizzazione non trovata.");
  if (!organization.stripeAccountId) {
    // Se non ha Stripe, segniamolo come "no_stripe"
    await db.organization.update({
      where: { id: organizationId },
      data: { ticketingStatus: "no_stripe" },
    });
    return "no_stripe";
  }

  // Recupera lo stato dell'account Stripe
  const account = await stripe.accounts.retrieve(organization.stripeAccountId);

  // Determiniamo il nuovo stato
  let newStatus = "pending";
  if (account.charges_enabled && account.payouts_enabled) {
    newStatus = "active";
  } else if (!account.details_submitted) {
    newStatus = "pending";
  } else {
    newStatus = "restricted";
  }

  // Aggiorna il database
  await db.organization.update({
    where: { id: organizationId },
    data: { ticketingStatus: newStatus },
  });

  return newStatus;
}
