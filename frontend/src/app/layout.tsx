import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Bey Card",
  description: "Beta – Cartes joueurs, QR, leaderboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800">
          <nav className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-4">
            <Link href="/" className="font-semibold">My Bey Card</Link>
            <div className="ml-auto flex gap-3 text-sm">
              <Link href="/leaderboard" className="hover:underline">Leaderboard</Link>
              <Link href="/profile" className="hover:underline">Profil</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
