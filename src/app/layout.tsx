import type { Metadata } from "next";
import { Cinzel, IBM_Plex_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Cinzel({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PPP Charity Vault",
  description: "Deposit USDC, keep your principal, Donate the yield.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem("ppp-theme");if(!t)t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
