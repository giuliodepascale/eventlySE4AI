"use client";

import { logout } from "@/actions/logout";


interface LogoutButtonProps {
    children: React.ReactNode
}

export const LogoutButton = ({children}:LogoutButtonProps) => {

    const onClick = () => {
        if (/EventlyApp/i.test(navigator.userAgent)) {
            (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView?.postMessage(
              JSON.stringify({ type: 'USER_LOGGED_OUT' })
            );
          }
        logout();
    }
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    )
}

export default LogoutButton;