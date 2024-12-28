'use client'

import { Button } from "@/components/ui/button";
import { Header } from "@/components/auth/header";
import Link from "next/link";

interface EmptyState {
    title?: string,
    subtitle?: string;
    showReset?: boolean;
}
 
const EmptyState:React.FC<EmptyState> = ({
    title = "No exact matches",
    subtitle = "Try changing or removign some of your filters",
    showReset

}) => {
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
            <div className="w-48 mt-4">
                {showReset && (
                    <Button 
                        variant={"outline"}
                        title="Remove all filters"
                        
                    >
                <Link href="/">
                    Admin
                </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default EmptyState;