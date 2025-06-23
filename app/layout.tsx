import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = { title: 'Weight Tracker' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@geist-ui/react@2.2.0/dist/geist-ui.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Sans&display=swap"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-900 text-white font-sans">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
