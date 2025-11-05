"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import Link from "next/link";

type Row = {
  id_discord: string;
  username: string;
  xp_total: number;
  wins: number;
  losses: number;
  matches: number;
  ratio: number;
};

export default function LeaderboardPage() {
  const [data, setData] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ items: Row[] }>("/leaderboard")
      .then((res) => setData(res.items))
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data.length) return <p>Chargement</p>;

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold"> Leaderboard</h1>
      <table className="min-w-full text-sm border border-neutral-800">
        <thead className="bg-neutral-900 text-neutral-300">
          <tr>
            <th className="p-2 text-left">#</th>
            <th className="p-2 text-left">Joueur</th>
            <th className="p-2 text-right">XP</th>
            <th className="p-2 text-right">Wins</th>
            <th className="p-2 text-right">Matches</th>
            <th className="p-2 text-right">Ratio</th>
          </tr>
        </thead>
        <tbody>
          {data.map((u, i) => (
            <tr key={u.id_discord} className="odd:bg-neutral-900/30">
              <td className="p-2">{i + 1}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2 text-right">{u.xp_total}</td>
              <td className="p-2 text-right">{u.wins}</td>
              <td className="p-2 text-right">{u.matches}</td>
              <td className="p-2 text-right">{u.ratio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
