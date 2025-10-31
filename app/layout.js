// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Intent-to-Solution Engine',
  description: 'AI-powered bundle optimization for complex purchases',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}