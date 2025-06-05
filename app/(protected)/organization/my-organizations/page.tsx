// app/my-organizations/page.tsx
import EmptyState from "@/components/altre/empty-state";
import { currentUser } from "@/lib/auth";
import OrganizationList from "@/components/organization/organization-list";
import { getOrganizationsByUser } from "@/MONGODB/CRUD/organization";
import type { SafeOrganization } from "@/app/types";

export default async function MyOrganizationPage() {
  // 1. Verifica che l’utente sia loggato
  const user = await currentUser();
  if (!user || !user.id) {
    return (
      <EmptyState
        title="Non hai i permessi"
        subtitle="Effettua il login per accedere a questa pagina."
      />
    );
  }

  // 2. Recupera le organizzazioni in cui l’utente è inserito
  const orgsResult = await getOrganizationsByUser(user.id);

  // 3. Gestisci eventuali errori
  if (!Array.isArray(orgsResult)) {
    return (
      <EmptyState
        title="Errore"
        subtitle={orgsResult.error || "Impossibile recuperare le organizzazioni."}
        showToHome
      />
    );
  }
  const organizations: SafeOrganization[] = orgsResult;

  // 4. Se non ci sono organizzazioni, mostra EmptyState
  if (organizations.length === 0) {
    return (
      <EmptyState
        title="Nessuna organizzazione trovata"
        subtitle="Non sei associato ad alcuna organizzazione."
        showToHome
      />
    );
  }

  // 5. Renderizza la lista delle organizzazioni
  return (
    <section className="px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Le mie organizzazioni</h1>
        <p className="text-gray-600 mt-1">
          Qui trovi tutte le organizzazioni di cui sei membro.
        </p>
      </header>

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
        "
      >
        <OrganizationList
          organizations={organizations}
          isOrganizationCreator
        />
      </div>
    </section>
  );
}
