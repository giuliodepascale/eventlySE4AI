import { getOrganizationById } from "@/MONGODB/CRUD/organization";
import EmptyState from "@/components/altre/empty-state";
import OrganizationClient from "@/components/organization/organization-client";
import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { SafeOrganization } from "@/app/types";

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

  // 3. Recupera il profilo completo dell’utente corrente (se serve)
  let fullUser = null;
  fullUser = await getUserById(user.id);

  return (
    <OrganizationClient
          organization={organization}
          currentUser={fullUser} organizers={[]}    />
  );
}
