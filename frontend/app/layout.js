import "../styles/globals.css";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { LanguageProvider } from "../context/LanguageContext";

export const metadata = {
  title: "Readify — Discover. Read. Learn.",
  description:
    "Discover, read, and organize books from a large, growing catalog.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-ink">
        <LanguageProvider>
          <Navbar />
          <Sidebar />

          <main className="min-h-[calc(100vh-60px)] lg:ml-[260px]">
            {children}
          </main>

          <div className="lg:ml-[260px]">
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}