'use client';
import {AiOutlineMenu} from 'react-icons/ai'
import {
    Avatar,
    AvatarFallback,
    AvatarImage
} from "@/components/ui/avatar";
import {useCallback, useState} from 'react';
import MenuItem from './menu-item';
import { signOut } from 'next-auth/react';

import { useRouter } from 'next/navigation';
import { ExtendedUser } from '@/next-auth';
import { FaUser } from "react-icons/fa";
import Link from 'next/link';


interface UserMenuProps {
    currentUser?: ExtendedUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({
    currentUser
} ) => {
    const router = useRouter();
   
    const [isOpen, setIsOpen] = useState(false);

    
    const toggleOpen = useCallback(() => {
        setIsOpen((value)=> !value);
    },[]);

   

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
               
                <div>
        <Link href="/my-favorites"
      
      className="
        hidden
        md:block
        text-sm
        font-semibold
        py-3
        px-4
        rounded-full
        hover:bg-neutral-100
        transition
        cursor-pointer
      ">
      I miei preferiti
      </Link></div>
      {currentUser && currentUser.role !== "USER" && (
      <div>
        <Link href="/organization/crea"
      
      className="
        hidden
        md:block
        text-sm
        font-semibold
        py-3
        px-4
        rounded-full
        hover:bg-neutral-100
        transition
        cursor-pointer
      ">
      Crea organizzazione
      </Link></div>
        )}
                <div
                onClick={toggleOpen}
                className="
                p-4
                md:py-1
                md:px-2
                border-[1px]
                border-neutral-200
                flex
                flex-row
                items-center
                gap-3
                rounded-full
                cursor-pointer
                hover:shadow-md
                transition
                ">
                    <AiOutlineMenu/>
                    <div
                    className="
                    hidden md:block">
                    <Avatar>
                    <AvatarImage src={currentUser?.image || ""}  />
                    <AvatarFallback className="bg-blue-600">
                        <FaUser className="text-white"/>
                    </AvatarFallback>
                     </Avatar>
                    </div>
                </div>
            </div>
            
                {isOpen && (
                    <div className='
                    absolute
                    rounded-xl
                    shadow-md
                    w-[40vw]
                    md:w-3/4
                    bg-white
                    overflow-hidden
                    right-0
                    top-12
                    text-sm
                    '>

                        <div className='
                            flex flex-col cursor-pointer'>
                            {currentUser ? (
                                <>
                                    <hr />
                                    <MenuItem
                                        onClick={() => {signOut()}}
                                        label="Logout"
                                    />
                                     <hr />
                                     <Link href="/settings">
                                    <MenuItem
                                        onClick={() => {}}
                                        label="Impostazioni"
                                    />
                                    </Link>
                                    {currentUser && currentUser.role !== "USER" && (
                                    <Link href="/organization/my-organizations">
                                    <MenuItem
                                        onClick={() => {}}
                                        label="Gestisci organizzazioni"
                                    />
                                    </Link>
                                    )}
                                </>
                            ) : 
                                <>  
                                <Link href="/auth/login">
                                    <MenuItem
                                        onClick={() => router.push('/auth/login')}
                                        label="Login"
                                    />
                                    </Link>
                                
                                </>
                            }
                        </div>
                </div>
                    
                )}
            
        </div>
    )
}

export default UserMenu;