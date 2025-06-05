import { getOrganizationById, getOrganizationsByUser } from "@/MONGODB/CRUD/organization";
import EmptyState from "@/components/altre/empty-state";
import EventForm from "@/components/events/event-form";

import { currentUser } from "@/lib/auth";
import type { SafeEvent, SafeOrganization } from "@/app/types";
import { getEventById } from "@/MONGODB/CRUD/events";


interface UpdateEventPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UpdateEventPage({ params }: UpdateEventPageProps) {
  const { organizationId, eventId } = await params;

  // 1. Verifica utente loggato
  const user = await currentUser();
  if (!user || !user.id) {
    return (
      <EmptyState
        title="Non hai i permessi"
        subtitle="Effettua il login per accedere a questa pagina."
      />
    );
  }

  // 2. Recupera l’organizzazione
  const orgResult = await getOrganizationById(organizationId as string);
  if (!orgResult || "error" in orgResult) {
    return (
      <EmptyState
        title="Organizzazione non trovata"
        subtitle="La pagina che stai cercando non esiste."
        showToHome
      />
    );
  }
  const organization: SafeOrganization = orgResult;

  // 3. Recupera l’evento
  const eventResult = await getEventById(eventId as string);
  if (!eventResult || "error" in eventResult) {
    return (
      <EmptyState
        title="Evento non trovato"
        subtitle="Qualcosa è andato storto."
        showToHome
      />
    );
  }
  const event: SafeEvent = eventResult;

  // 4. Controlla che l’evento appartenga all’organizzazione
  if (event.organizationId !== organization.id) {
    return (
      <EmptyState
        title="Accesso Negato"
        subtitle="Non hai il permesso per modificare questo evento."
        showToHome
      />
    );
  }

  // 5. Verifica se l’utente è organizzatore di questa organizzazione
  const userOrgsResult = await getOrganizationsByUser(user.id);
  if (!Array.isArray(userOrgsResult) || userOrgsResult.length === 0) {
    return (
      <EmptyState
        title="Accesso Negato"
        subtitle="Solo gli organizzatori possono accedere a questa pagina."
        showToHome
      />
    );
  }
  const isOrganizer = userOrgsResult.some((org) => org.id === organization.id);
  if (!isOrganizer) {
    return (
      <EmptyState
        title="Accesso Negato"
        subtitle="Solo gli organizzatori possono accedere a questa pagina."
        showToHome
      />
    );
  }

  // 6. Renderizza il form di aggiornamento dell’evento
  return (
    <>
      <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
        <h3 className="text-2xl font-bold text-center">Aggiorna il tuo Evento</h3>
      </section>

      <div className="p-4">
        <EventForm organization={organization} event={event} type="update" />
      </div>
    </>
  );
}
