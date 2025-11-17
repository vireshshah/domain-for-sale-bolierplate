import type { Metadata } from 'next'
import './globals.css'
import config from '../config/domain-config.json'

export const metadata: Metadata = {
  title: config.seo.title,
  description: config.seo.description,
  keywords: config.seo.keywords,
  openGraph: {
    title: config.seo.title,
    description: config.seo.description,
    images: [config.seo.ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: config.seo.title,
    description: config.seo.description,
    images: [config.seo.ogImage],
  },
  icons: {
    icon: config.seo.favicon,
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://yourdomain.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Viewport and other meta tags */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Google Analytics */}
        {config.analytics.googleAnalytics.enabled && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalytics.trackingId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${config.analytics.googleAnalytics.trackingId}');
                `,
              }}
            />
          </>
        )}
        
        {/* Structured data for better SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": config.domain.name,
              "description": config.domain.description,
              "offers": {
                "@type": "Offer",
                "price": config.domain.priceNumeric,
                "priceCurrency": config.domain.currency,
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": config.contact.name,
                  "email": config.contact.email
                }
              }
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 