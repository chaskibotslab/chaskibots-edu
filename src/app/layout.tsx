import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ChaskiBots EDU - Plataforma Educativa de Robótica e IA',
  description: 'Aprende robótica, programación, inteligencia artificial y hacking ético desde Inicial hasta Bachillerato',
  keywords: 'robótica educativa, programación niños, inteligencia artificial, STEM, Ecuador',
  authors: [{ name: 'ChaskiBots' }],
  openGraph: {
    title: 'ChaskiBots EDU',
    description: 'Plataforma educativa de robótica e inteligencia artificial',
    url: 'https://chaskibots.com/app',
    siteName: 'ChaskiBots EDU',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
