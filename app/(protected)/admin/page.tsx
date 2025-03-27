"use client"

import { admin } from "@/actions/admin";
import { sendPushToUser } from "@/actions/sendPushNotificationToUser";
import { RoleGate } from "@/components/auth/role-gate";
import { FormSuccess } from "@/components/form-success";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";



const AdminPage = () => {

    const notify = async () => {
       const userId = "cm7mdnmma0000sjyg2d4lh2kh"
        const result = await sendPushToUser(
           userId,
          'Messaggio per te!',
          'Hai ricevuto una notifica di test 🎉',
          { url: '/eventi/preview' }
        );
    
        if (result.success) alert('Notifica inviata!');
        else alert('Errore: ' + result.error);
      };

    const onServerActionClick = () => {
        admin()
        .then((data) => {
            if(data.success) {
                toast.success("Server action concessa")
            }
            if(data.error) {
                toast.error("Server action proibita")
            }

        })
    }

    const onApiRouteClick = () => {
        fetch("/api/admin")
        .then((response) => {
            if(response.ok) {
                toast.success("Api route concessa")
            }
            else {
                toast.error("Api route proibita")
            }
        })
    }

    return (
        <>
        <Card className="w-[600px]"> 
            <CardHeader>
                <p className="text-2xl font-semibold text-center">
                    Admin
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                <RoleGate allowedRole={UserRole.ADMIN}>
                    <FormSuccess message="Sei un admin! e quindi sei autorizzato a vedere questo testo"/>
                </RoleGate>

            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
                <p className="text-sm font-medium">
                    Solo admin API route
                </p>
                <Button onClick={onApiRouteClick}>
                    Click to test
                </Button>
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-md">
                <p className="text-sm font-medium">
                    Solo admin Server action
                </p>
                <Button onClick={onServerActionClick}>
                    Click to test
                </Button>
            </div>
            </CardContent>     
               
        </Card> 

            <button onClick={notify}>Invia notifica di test</button>;
            </>

    )
}
export default AdminPage;