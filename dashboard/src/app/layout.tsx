import { type ReactNode } from "react";
import Script from "next/script";
import "@/styles/globals.css";
import { env } from "@/env";
import EnvScript from "@/env-script";
import OledModeProvider from "@/components/OledModeProvider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

export { metadata } from "@/metadata";
export { viewport } from "@/viewport";

type Props = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} font-sans text-white`}>
      <head>
        <EnvScript />
        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="F1 Naija" />
        <link rel="apple-touch-icon" href="/tag-logo.png" />
        {env.TRACKING_ID && env.TRACKING_URL && (
          <>
            <Script
              strategy="afterInteractive"
              data-site-id={env.TRACKING_ID}
              src={env.TRACKING_URL}
            />
          </>
        )}
        {/* Register service worker */}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.warn('SW registration failed:', err);
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <OledModeProvider>{children}</OledModeProvider>
      </body>
    </html>
  );
}
