import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const badges = [
    { slug: "wins_10", name: "10 victoires", rule: { type: "wins", gte: 10 } },
    { slug: "wins_50", name: "50 victoires", rule: { type: "wins", gte: 50 } },
    { slug: "wins_100", name: "100 victoires", rule: { type: "wins", gte: 100 } },
    { slug: "matches_10", name: "10 matchs", rule: { type: "matches", gte: 10 } },
    { slug: "matches_25", name: "25 matchs", rule: { type: "matches", gte: 25 } },
    { slug: "matches_50", name: "50 matchs", rule: { type: "matches", gte: 50 } },
    { slug: "matches_100", name: "100 matchs", rule: { type: "matches", gte: 100 } },
    { slug: "xp_100", name: "100 XP cumulés", rule: { type: "xp", gte: 100 } },
    { slug: "xp_500", name: "500 XP cumulés", rule: { type: "xp", gte: 500 } },
    { slug: "xp_1000", name: "1000 XP cumulés", rule: { type: "xp", gte: 1000 } },
    { slug: "first_match", name: "Premier combat", rule: { type: "first_match" } }
  ];
  for (const b of badges) {
    await prisma.badge.upsert({ where: { slug: b.slug }, create: b as any, update: {} });
  }
  console.log("✅ Badges seedés");
}
main().finally(() => prisma.$disconnect());
