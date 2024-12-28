"use client";

import { UserButton } from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import { ExtendedUser } from "@/next-auth";
import  Link  from "next/link";
import { usePathname } from "next/navigation";
import Container from "./container";

//la navbar non è responsive per ora (non è lo scopo del tutotrial auth)

interface NavbarProps {
    currentUser?: ExtendedUser | null
}

export const Navbar: React.FC<NavbarProps> = ({
    currentUser
}) => {

    const pathname = usePathname();

    return ( 

        <div className="fixed w-full bg-white z-10 shadow-sm">
    <div className ="py-4 border-b-[1px]">

    <Container>
    <div className="
        flex
        flex-row
        items-center
        justify-between
        gap-3
        md:gap-0
        ">
        
          <Button 
            variant={pathname === "/admin" ? "default" : "outline"}
            asChild
            >
                <Link href="/admin">
                    Admin
                </Link>
            </Button>
            <Button 
            variant={pathname === "/client" ? "default" : "outline"}
            asChild
            >
                <Link href="/client">
                    Client
                </Link>
            </Button>
            <Button 
            variant={pathname === "/server" ? "default" : "outline"}
            asChild
            >
                <Link href="/server">
                    Server
                </Link>
            </Button>
            <Button 
            variant={pathname === "/settings" ? "default" : "outline"}
            asChild
            >
                <Link href="/settings">
                    Settings
                </Link>
            </Button>
        </div>
        </Container>
    </div>
   {// TODO AGGIUNGERE CLIENT PER LE CATEGORIE.
   }
    </div>
    );
};


export default Navbar;
       
   