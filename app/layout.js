// app/layout.js
import './globals.css';

export const metadata = {
  title: 'BundleUp Enhanced',
  description: 'AI-powered PC builder',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}