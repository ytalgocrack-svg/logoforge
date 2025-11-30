import './globals.css'
import { ThemeProvider } from '@/context/ThemeContext';
import AdScripts from '@/components/AdScripts'; // <--- Import

export const metadata = {
  title: 'EditorsAdda',
  description: 'Premium Editing Assets',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#0f172a] text-slate-100" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <ThemeProvider>
          <AdScripts /> {/* <--- Add this here */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
