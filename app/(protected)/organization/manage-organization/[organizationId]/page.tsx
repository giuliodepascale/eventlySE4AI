import { getOrganizationById } from "@/actions/organization";
import EmptyState from "@/components/altre/empty-state";
import OrganizationManagement from "@/components/organization/organization-management";
import { currentUser } from "@/lib/auth";

interface OrganizationPageProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>;
  }


export default async function OrganizationPage({ params }: OrganizationPageProps) {
    
    const {organizationId} = await params;
    
    // Estrai l'ID dai parametri di ricerca

    const user = await currentUser();

    const organizationResult = await getOrganizationById(organizationId as string || '');

    // Controlla se l'organizzazione è stata trovata e se esiste
    if (!organizationResult || !organizationResult.organization) {
    return (
        <EmptyState 
            title="Organizzazione non trovata" 
            subtitle="La pagina che stai cercando non esiste." 
            showToHome
        />
     );
    }

    // Controlla se l'utente è loggato
    if (!user || !user.id) {
        return (
        <EmptyState 
            title="Non hai i permessi" 
            subtitle="Effettua il login per accedere a questa pagina." 
        />
        );
    }

    // Estrai l'organizzazione e gli organizzatori dal risultato
    const { organization, organizers, error } = organizationResult;
   
    // Controlla se c'è un errore
    if (error) {
    return (
        <EmptyState 
            title="Errore" 
            subtitle={error} 
        />
        );
    }   

    
    // Verifica se l'utente corrente è tra gli organizzatori
    const isOrganizer = organizers.some((organizer) => organizer.id === user.id);

    

    if (!isOrganizer) {
        return (
            <EmptyState 
                title="Accesso Negato" 
                subtitle="Solo gli organizzatori possono accedere a questa pagina." 
                showToHome
            />
        );
    }

   

    return (
            <OrganizationManagement organization={organization} />
    )
}

