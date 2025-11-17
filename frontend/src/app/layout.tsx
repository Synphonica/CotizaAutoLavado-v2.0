import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MapProviderContextProvider } from "@/contexts/MapProviderContext";
import { AppProvider } from "@/lib/providers/app-provider";
import { ApiInitializer } from "@/lib/providers/api-initializer";
import { ToastProvider } from "@/hooks/useToast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkBackendSync } from "@/components/ClerkBackendSync";
import { BackendConnectionToast } from "@/components/BackendConnectionToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alto Carwash - Compara y Ahorra",
  description: "Plataforma de comparación de servicios de autolavado. Encuentra los mejores precios cerca de ti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const useClerk = Boolean(publishableKey && publishableKey.length > 0);

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <ToastProvider>
            <AppProvider>
              <MapProviderContextProvider>
                <BackendConnectionToast />
                {useClerk ? (
                  <ClerkProvider
                    publishableKey={publishableKey}
                    signInUrl="/sign-in"
                    signUpUrl="/sign-up"
                    afterSignInUrl="/dashboard"
                    afterSignUpUrl="/dashboard"
                  >
                    <ClerkBackendSync>
                      <ApiInitializer>
                        {children}
                        <Footer />
                      </ApiInitializer>
                    </ClerkBackendSync>
                  </ClerkProvider>
                ) : (
                  <>
                    {children}
                    <Footer />
                  </>
                )}
              </MapProviderContextProvider>
            </AppProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
