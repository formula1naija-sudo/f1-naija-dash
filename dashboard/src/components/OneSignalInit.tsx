"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    OneSignalDeferred?: ((OneSignal: OneSignalType) => void)[];
  }
}

interface OneSignalType {
  init: (config: {
    appId: string;
    notifyButton?: { enable: boolean };
    welcomeNotification?: { disable: boolean };
  }) => Promise<void>;
}

export default function OneSignalInit() {
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    if (!appId) return;

    window.OneSignalDeferred = window.OneSignalDeferred ?? [];

    window.OneSignalDeferred.push(async (OneSignal: OneSignalType) => {
      await OneSignal.init({
        appId,
        notifyButton: { enable: false },
        welcomeNotification: { disable: true },
      });
    });

    const script = document.createElement("script");
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
