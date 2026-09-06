import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Equipos de trabajo",
  description: "Gestión de equipos de trabajo, servicios y asignaciones",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "LuaOne",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/LuaOne-icono-256.png", sizes: "256x256", type: "image/png" },
      { url: "/LuaOne-icono-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/LuaOne-icono-180-appstore.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Se ejecuta antes de pintar la página para que no haya parpadeo:
          // por defecto es oscuro, y solo si alguien eligió "claro" antes, se quita.
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-page text-foreground">
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
