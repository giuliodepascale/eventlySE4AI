"use client";

import { logout } from "@/actions/logout";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
    children: React.ReactNode
}

export const LogoutButton = ({children}:LogoutButtonProps) => {
    const router = useRouter();
    const onClick = () => {
         // Prima manda USER_LOGGED_OUT a WebView
    if (/EventlyApp/i.test(navigator.userAgent)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).ReactNativeWebView?.postMessage(
          JSON.stringify({ type: "USER_LOGGED_OUT" })
        );
      }
        logout();
        router.push("/");
    }
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    )
}

export default LogoutButton;