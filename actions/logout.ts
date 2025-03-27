"use server";

import { signOut } from "@/auth";

export const logout = async () => {
    if (/EventlyApp/i.test(navigator.userAgent)) {
        (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView?.postMessage(
          JSON.stringify({ type: 'USER_LOGGED_OUT' })
        );
      }
    await signOut();
}