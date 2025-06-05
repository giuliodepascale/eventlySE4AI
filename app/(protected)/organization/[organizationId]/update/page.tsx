
import { getOrganizationById, getOrganizationsByUser } from "@/app/MONGODB/CRUD/organization";
import EmptyState from "@/components/altre/empty-state";
import OrganizationForm from "@/components/organization/organization-form";
import { currentUser } from "@/lib/auth";
import type { SafeOrganization } from "@/app/types";

interface UpdateOrganizationPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UpdateOrganizationPage({ params }: UpdateOrganizationPageProps) {
  const { organizationId } = await params;

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

  // 3. Controlla che l’utente sia effettivamente organizzatore
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

  // 4. Renderizza il form di aggiornamento
  return (
    <>
      <section className="bg-primary-50 dark:bg-black/15 bg-cover bg-center py-5 md:py-10">
        <h3 className="text-2xl font-bold text-center">
          Aggiorna la tua organizzazione
        </h3>
      </section>

      <div className="p-4">
        <OrganizationForm
          organization={organization}
          userIdprops={user.id}
          type="update"
        />
      </div>
    </>
  );
}
