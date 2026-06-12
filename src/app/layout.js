import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "STOCKPRODUCT - Stock Product Management",
  description: "Modern, real-time stock and product management system built with Next.js and Supabase.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col" style={{ paddingTop: '68px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
