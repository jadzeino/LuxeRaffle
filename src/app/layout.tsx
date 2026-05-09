import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppFooter } from '@/components/app-footer/app-footer';
import { AppHeader } from '@/components/app-header/app-header';
import { siteDescription, siteName, siteUrl } from '@/lib/site';
import { isTheme, THEME_COOKIE } from '@/lib/theme';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LuxeRaffle | Luxury Car Raffles',
    template: '%s | LuxeRaffle',
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteName,
    description: 'Premium raffle experiences for world-class cars.',
    siteName,
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: 'Premium raffle experiences for world-class cars.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCookie = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : 'light';

  return (
    <html lang="en" className={theme === 'dark' ? 'dark' : undefined}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="grid min-h-dvh grid-rows-[auto_1fr_auto]">
          <AppHeader theme={theme} />
          {children}
          <AppFooter />
        </div>
      </body>
    </html>
  );
}
