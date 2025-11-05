"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { API_URL, api } from "../../../lib/api";
import QRCode from "react-qr-code";

type Me = {
  id_discord: string;
  username: string;
  avatar_url?: string;
  xp_total: number;
  wins: number;
  losses: number;
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Me>("/auth/me")
      .then(setMe)
      .catch((e) => setError(e.message || "Non connect�"));
  }, []);

  if (error) {
    return (
      <section className="grid gap-4">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-red-400">{error}</p>
        <a
          href={`${API_URL}/auth/login`}
          className="rounded-xl bg-indigo-600 px-5 py-2 font-medium hover:bg-indigo-500"
        >
          Se connecter avec Discord
        </a>
      </section>
    );
  }

  if (!me) return <p>Chargement�</p>;

  const matches = me.wins + me.losses;
  const ratio = matches ? (me.wins / matches).toFixed(2) : "0.00";

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <div className="flex items-center gap-4">
        {me.avatar_url && (
          <Image
            src={me.avatar_url}
            alt={me.username}
            width={72}
            height={72}
            className="rounded-full border border-neutral-700"
          />
        )}
        <div>
          <div className="text-xl font-semibold">{me.username}</div>
          <div className="text-neutral-400 text-sm">XP : {me.xp_total}</div>
        </div>
      </div>
      <div className="bg-white p-4 w-fit rounded-md">
        <QRCode value={`${window.location.origin}/u/${me.id_discord}`} size={220} />
      </div>
    </section>
  );
}
