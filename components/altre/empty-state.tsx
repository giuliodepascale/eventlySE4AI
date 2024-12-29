'use client'

import { Button } from "@/components/ui/button";
import { Header } from "@/components/auth/header";
import { useRouter } from "next/navigation";

interface EmptyState {
    title?: string,
    subtitle?: string;
    showReset?: boolean;
}
 
const EmptyState:React.FC<EmptyState> = ({
    title = "Nessun risultato trovato",
    subtitle = "Prova a modificare i filtri di ricerca",
    showReset

}) => {

    const router = useRouter();

    return (
        <div className="
            h-[60vh]
            flex
            flex-col
            gap-2
            justify-center
            items-center
        ">
            <Header 
            title={title}
            subtitle={subtitle}
            center
            />
            <div className="w-48 mt-4 text-center">
                {showReset && (
                    <Button 
                    variant={"outline"}
                    size={"lg"}
                    onClick={()=> router.push('/')}
                >
                    Rimuovi i filtri
                </Button>
                )}
            </div>
        </div>
    )
}

export default EmptyState;