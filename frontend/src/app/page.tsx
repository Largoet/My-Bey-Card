"use client";

import { API_URL } from "../../lib/api";

export default function Home() {
  const login = () => {
    window.location.href = `${API_URL}/auth/login`;
  };

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">Bienvenue ??</h1>
      <p>Connecte-toi avec Discord pour cr�er ta carte joueur et acc�der au classement.</p>
      <button
        onClick={login}
        className="w-fit rounded-xl bg-indigo-600 px-5 py-2 font-medium hover:bg-indigo-500"
      >
        Se connecter avec Discord
      </button>
    </section>
  );
}
