// app/(protected)/organization/[organizationId]/page.tsx
import EmptyState from "@/components/altre/empty-state";
import EventList from "@/components/events/events-list";
import OrganizationManagement from "@/components/organization/organization-management";
import { currentUser } from "@/lib/auth";

import { getUserById } from "@/data/user";
import { getOrganizationById, getOrganizationsByUser } from "@/app/MONGODB/CRUD/organization";
import { SafeEvent, SafeOrganization } from "@/app/types";
import { User } from "@prisma/client";
import { getEventsByOrganization } from "@/data/event";

interface OrganizationPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
    const { organizationId } = await params;

  // 1. Controlla l’utente loggato
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

  // 3. Verifica se l’utente è effettivamente organizzatore
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

  // 4. Recupera gli eventi di questa organizzazione
  const eventsResult = await getEventsByOrganization(organization.id);
  // eventsResult ha la forma { events: SafeEvent[], pagination: { … } }
  const events: SafeEvent[] = Array.isArray(eventsResult.events)
    ? eventsResult.events
    : [];

  // 5. Recupera dati utente completo (se serve in EventList)
  let fullUser: User | null = null;
  fullUser = await getUserById(user.id);

  return (
    <>
      <OrganizationManagement organization={organization} />

      <div className="mt-8 text-xl font-semibold">I miei eventi</div>
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
          mt-4
        "
      >
        <EventList
          events={events}
          currentUser={fullUser as User}
          isEventCreator={true}
        />
      </div>
    </>
  );
}
