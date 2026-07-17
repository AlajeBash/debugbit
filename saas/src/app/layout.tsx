import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'DebugBit SaaS Platform - AI Developer Intelligence Dashboard',
  description: 'Scalable cloud telemetry dashboard for monitoring, correlating application events, and conducting AI root-cause analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;600;800;900&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans antialiased min-h-screen flex flex-col">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

