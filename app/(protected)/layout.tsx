import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

const ProtectedLayout = async ({ children }:ProtectedLayoutProps ) => {

    const session = await auth()

    return (
    <SessionProvider session={session}>
        <div className="flex min-h-screen items-center justify-center bg-white-100 px-4 sm:px-6 lg:px-8">
            {children}
    </div>
    </SessionProvider>

    )
};

export default ProtectedLayout;