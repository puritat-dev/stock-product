import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "STOCKPRODUCT - Premium Inventory Management",
  description: "Modern, real-time stock and warehouse inventory management system built with Next.js and Supabase.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
