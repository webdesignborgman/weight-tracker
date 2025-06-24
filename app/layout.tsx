// app/layout.tsx
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { geist } from './fonts'; // <- dit moet je eerst aanmaken (zie uitleg eerder)

export const metadata = {
  title: 'Weight Tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body className={`${geist.className} flex flex-col min-h-screen bg-slate-900 text-white`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
