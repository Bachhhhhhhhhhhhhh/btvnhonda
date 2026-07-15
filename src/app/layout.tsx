import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: "LOG Twin Command Center · Honda MC DSS",
  description:
    "Command Center Digital Twin — stacking, transfer Bắc–Nam, what-if, Monte Carlo — Honda Việt Nam. Tạo bởi Bach Truong, Intern phòng BMLG.",
  authors: [{ name: "Bach Truong" }],
  creator: "Bach Truong · Intern · phòng BMLG · Honda Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('log-twin-theme-v2')||localStorage.getItem('log-twin-theme-v1');var m='dark';if(t){var p=JSON.parse(t);if(p.state&&p.state.mode)m=p.state.mode==='light'?'light':'dark';}document.documentElement.setAttribute('data-theme',m);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
