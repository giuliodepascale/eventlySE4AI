"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { flushSync } from "react-dom";

interface LogoutButtonProps {
  children: React.ReactNode;
}

export const LogoutButton = ({ children }: LogoutButtonProps) => {
  const router = useRouter();

  const onClick = async () => {
    if (/EventlyApp/i.test(navigator.userAgent)) {
      const message = JSON.stringify({ type: "USER_LOGGED_OUT" });

      // Flush sincronizzato prima del logout
      flushSync(() => {
        (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView?.postMessage(message);
      });

      // Attendi il prossimo ciclo di repaint (garantisce invio del messaggio)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    }

    // Ora puoi eseguire il logout e redirect
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <span onClick={onClick} className="cursor-pointer">
      {children}
    </span>
  );
};

export default LogoutButton;


