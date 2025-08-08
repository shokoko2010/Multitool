import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Navigation } from '@/components/navigation'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'Free Online Tools - 235+ Multi-Tool Platform',
    template: '%s | Free Online Tools'
  },
  description: 'Discover 235+ free online tools for SEO, development, design, and productivity. Fast, secure, and easy-to-use tools for professionals and beginners.',
  keywords: [
    'free online tools',
    'seo tools',
    'development tools',
    'image tools',
    'text utilities',
    'network tools',
    'security tools',
    'converters',
    'calculators',
    'productivity tools',
    'web tools',
    'programming tools',
    'design tools',
    'optimization tools'
  ],
  authors: [{ name: 'Multi-Tool Platform', url: 'https://yourdomain.com' }],
  creator: 'Multi-Tool Platform',
  publisher: 'Multi-Tool Platform',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourdomain.com',
    title: 'Free Online Tools - 235+ Multi-Tool Platform',
    description: 'Discover 235+ free online tools for SEO, development, design, and productivity. Fast, secure, and easy-to-use tools for professionals and beginners.',
    siteName: 'Free Online Tools',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Free Online Tools Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Tools - 235+ Multi-Tool Platform',
    description: 'Discover 235+ free online tools for SEO, development, design, and productivity.',
    images: ['/twitter-image.jpg'],
    creator: '@yourhandle',
  },
  alternates: {
    canonical: 'https://yourdomain.com',
    languages: {
      'en-US': 'https://yourdomain.com',
    },
  },
  metadataBase: new URL('https://yourdomain.com'),
  other: {
    'twitter:image': '/twitter-image.jpg',
    'twitter:image:alt': 'Free Online Tools Platform',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Free Online Tools",
              description: "Discover 235+ free online tools for SEO, development, design, and productivity",
              url: "https://yourdomain.com",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD"
              },
              creator: {
                "@type": "Organization",
                name: "Multi-Tool Platform",
                url: "https://yourdomain.com"
              },
              featureList: [
                "SEO Tools",
                "Development Tools", 
                "Image Processing",
                "Text Utilities",
                "Network Analysis",
                "Security Tools",
                "Data Conversion",
                "Cryptography"
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "1000"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
          <Toaster />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  )
}