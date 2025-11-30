import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata = {
  title: 'EditorsAdda - Content Bawaal, Editing Kamaal!',
  description: 'The ultimate hub for PLP, XML, and Editing Assets.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0f172a] text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
