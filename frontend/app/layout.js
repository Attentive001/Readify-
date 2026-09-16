import "../styles/globals.css";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Readify — Discover. Read. Learn.",
  description:
    "Discover, read, and organize books from a large, growing catalog.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Lora:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen font-sans text-ink">
        <Navbar />

        <Sidebar />

        <main className="min-h-[calc(100vh-60px)] lg:ml-[260px]">
          {children}
        </main>

        <div className="lg:ml-[260px]">
          <Footer />
        </div>
      </body>
    </html>
  );
}