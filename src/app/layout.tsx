import { Main } from '@/components/elements/main'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Community Knowledge Weaver',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wdth,wght@0,112.5,200..900;1,112.5,200..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Main>{children}</Main>
      </body>
    </html>
  )
}
