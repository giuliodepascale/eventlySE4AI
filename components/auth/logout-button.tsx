"use client";


import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
    children: React.ReactNode
}

export const LogoutButton = ({children}:LogoutButtonProps) => {
    const router = useRouter();

  const onClick = async () => {
    // 🔁 Invia evento logout alla WebView, se sei in app
    if (/EventlyApp/i.test(navigator.userAgent)) {
      (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } })
        .ReactNativeWebView?.postMessage(
          JSON.stringify({ type: "USER_LOGGED_OUT" })
        );
    }

    // 🔐 Logout lato client
    await signOut({ redirect: false });

    // ↪️ Redirect manuale
    router.push("/");
  };
    return (
        <span onClick={onClick} className="cursor-pointer">
            {children}
        </span>
    )
}

export default LogoutButton;