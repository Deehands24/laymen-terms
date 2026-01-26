import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Medical Terms Translator - Simplify Complex Medical Language",
    template: "%s | Medical Terms Translator"
  },
  description: "Instantly translate complex medical terminology into simple, easy-to-understand language. Powered by AI to help patients understand their medical reports, prescriptions, and diagnoses.",
  keywords: [
    "medical terms translator",
    "medical terminology",
    "medical jargon simplified",
    "understand medical reports",
    "patient education",
    "medical language translator",
    "healthcare terminology",
    "medical diagnosis explanation",
    "prescription translation",
    "medical AI assistant"
  ],
  authors: [{ name: "Medical Terms Translator" }],
  creator: "Medical Terms Translator",
  publisher: "Medical Terms Translator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN || 'https://medicalterms.vercel.app'),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Medical Terms Translator - Simplify Complex Medical Language",
    description: "Instantly translate complex medical terminology into simple, easy-to-understand language. Powered by AI to help patients understand their medical reports.",
    url: "/",
    siteName: "Medical Terms Translator",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Medical Terms Translator - Simplify Medical Language",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Terms Translator - Simplify Complex Medical Language",
    description: "Instantly translate complex medical terminology into simple, easy-to-understand language with AI.",
    images: ["/og-image.png"],
  },
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
  verification: {
    // Add these once you verify with search engines
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Medical Terms Translator",
              "description": "Instantly translate complex medical terminology into simple, easy-to-understand language using AI.",
              "url": process.env.NEXT_PUBLIC_DOMAIN || "https://medicalterms.vercel.app",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "0",
                "highPrice": "29.99",
                "offerCount": "4"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "featureList": [
                "AI-powered medical terminology translation",
                "Instant medical text simplification",
                "Patient-friendly explanations",
                "Multiple subscription tiers",
                "Translation history tracking"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-white to-[rgba(229,250,252,0.3)] backdrop-blur-sm">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
