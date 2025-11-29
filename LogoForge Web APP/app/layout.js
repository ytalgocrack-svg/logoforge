import './globals.css'

export const metadata = {
  title: 'LogoForge - Premium Design Assets',
  description: 'Download high-quality PLP, XML, and PNG logos.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Import Font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 min-h-screen text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
