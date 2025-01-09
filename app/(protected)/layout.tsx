

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

const ProtectedLayout = async ({ children }:ProtectedLayoutProps ) => {

    

    return (
    
        <div className="flex min-h-screen items-center justify-center bg-white-100 px-4 sm:px-6 lg:px-8">
            {children}
    </div>
  

    )
};

export default ProtectedLayout;