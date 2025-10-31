import './globals.css'

export const metadata = {
  title: 'BundleUp - Intent-to-Solution Engine',
  description: 'AI-powered problem solving for complex purchases',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}