// app/layout.tsx
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = { title: 'Weight Tracker' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Header />
        <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}