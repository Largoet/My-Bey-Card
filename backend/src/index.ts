// backend/src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import axios from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";

const prisma = new PrismaClient();
const app = express();

const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/* ----------------------- App / sécurité globale ----------------------- */
app.set("trust proxy", 1);                 // utile derrière un proxy/ingress
app.disable("x-powered-by");               // masque Express

// Helmet (en-têtes de sécurité)
app.use(helmet({
  frameguard: { action: "deny" },
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: "no-referrer" },
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// Limiteur global (défense douce)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

// CORS strict (autorise seulement ton front et les cookies)
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());
app.use(cookieParser());

// Limiteurs ciblés (anti-abus sur auth/écriture)
const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false
});
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/auth", authLimiter);
app.use(["/matches"], writeLimiter);
if (!isProd) app.use(["/debug"], writeLimiter);

/* ----------------------- Helpers JWT & cookies ----------------------- */
function signJWT(payload: object) {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}
function verifyJWT(token?: string) {
  try {
    if (!token) return null;
    const secret = process.env.JWT_SECRET || "dev-secret";
    return jwt.verify(token, secret) as any;
  } catch {
    return null;
  }
}
const cookieOpts: {
  httpOnly: boolean;
  sameSite: "lax" | "strict";
  secure: boolean;
  path: string;
  maxAge: number;
} = {
  httpOnly: true,
  sameSite: (isProd ? "strict" : "lax"),
  secure: isProd,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 30 // 30j
};

/* ----------------------- Middleware d'auth ----------------------- */
async function auth(req: any, res: any, next: any) {
  const authz = req.header("authorization") || "";
  const bearer = authz.startsWith("Bearer ") ? authz.slice(7) : null;
  const token = bearer || req.cookies?.token;
  const decoded = verifyJWT(token);

  // En prod, on ignore x-user-id (gardé pour tests en dev)
  const allowDevHeader = !isProd;
  const idFromHeader = allowDevHeader ? req.header("x-user-id") : undefined;

  const id = decoded?.id_discord || idFromHeader;
  if (!id) return res.status(401).json({ error: "unauthorized" });

  const user = await prisma.user.findUnique({ where: { id_discord: id } });
  if (!user) return res.status(401).json({ error: "unauthorized" });

  req.user = user;
  next();
}

/* =========================================================
 * ==================== DISCORD OAUTH ======================
 *  - paramètre `state` anti-CSRF
 *  - redirige vers FRONTEND_URL/profile à la fin
 * =======================================================*/

// 1) Login → redirige vers Discord avec `state`
app.get("/auth/login", (req, res) => {
  const state = crypto.randomUUID();
  res.cookie("oauth_state", state, {
    ...cookieOpts,
    maxAge: 1000 * 60 * 10 // 10 minutes pour le flow OAuth
  });

  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || "",
    redirect_uri: process.env.DISCORD_REDIRECT_URI || "",
    response_type: "code",
    scope: "identify guilds",
    prompt: "consent",
    state
  }).toString();

  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

// 2) Callback → échange code, vérifie serveur, set cookie JWT, redirige
app.get("/auth/callback", async (req, res) => {
  const code = String(req.query.code || "");
  const state = String(req.query.state || "");
  const stateCookie = req.cookies?.oauth_state;

  if (!code) return res.status(400).send("Missing code");
  if (!stateCookie || stateCookie !== state) {
    return res.status(400).send("Invalid OAuth state");
  }
  res.clearCookie("oauth_state", { ...cookieOpts });

  try {
    // échange code -> access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI || ""
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenRes.data.access_token as string;
    if (!access_token) return res.status(401).send("OAuth exchange failed");

    // infos user + serveurs
    const [meRes, guildsRes] = await Promise.all([
      axios.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` }
      }),
      axios.get("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${access_token}` }
      })
    ]);

    const me = meRes.data as { id: string; username: string; avatar?: string };
    const guilds = guildsRes.data as Array<{ id: string }>;

    const inGuild = guilds.some((g) => g.id === process.env.DISCORD_GUILD_ID);
    if (!inGuild) {
      return res.status(403).send("Accès réservé aux membres du serveur Discord.");
    }

    const avatarUrl = me.avatar
      ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png`
      : undefined;

    const user = await prisma.user.upsert({
      where: { id_discord: me.id },
      create: { id_discord: me.id, username: me.username, avatar_url: avatarUrl },
      update: { username: me.username, avatar_url: avatarUrl }
    });

    // set JWT en cookie httpOnly
    const token = signJWT({ id_discord: user.id_discord, username: user.username });
    res.cookie("token", token, cookieOpts);

    // redirige vers le profil du front
    res.redirect(`${FRONTEND_URL}/profile`);
  } catch (e: any) {
    console.error(e?.response?.data || e?.message);
    res.status(500).send("OAuth error");
  }
});

// 3) Infos utilisateur connecté
app.get("/auth/me", auth, async (req: any, res) => {
  res.json(req.user);
});

// 4) Logout
app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", { ...cookieOpts });
  res.json({ ok: true });
});

/* =========================================================
 * ==================== ROUTES DEBUG DEV ===================
 *  (automatiquement désactivées en prod)
 * =======================================================*/
if (!isProd) {
  app.post("/debug/create-user", async (req, res) => {
    const { id_discord, username } = req.body;
    if (!id_discord || !username)
      return res.status(400).json({ error: "id_discord & username required" });
    const user = await prisma.user.upsert({
      where: { id_discord },
      create: { id_discord, username },
      update: { username }
    });
    res.json(user);
  });

  app.post("/debug/gen-matches", async (req, res) => {
    const { a, b, n = 5 } = req.body;
    if (!a || !b) return res.status(400).json({ error: "a & b required" });

    const A = await prisma.user.findUnique({ where: { id_discord: a } });
    const B = await prisma.user.findUnique({ where: { id_discord: b } });
    if (!A || !B) return res.status(404).json({ error: "user not found" });

    const results: any[] = [];
    for (let i = 0; i < Number(n); i++) {
      const winner_id = Math.random() > 0.5 ? a : b;
      const aWin = winner_id === a;
      const xpA = aWin ? 10 : 3;
      const xpB = aWin ? 3 : 10;

      const [updatedMatch, userA, userB] = await prisma.$transaction([
        prisma.match.create({
          data: {
            player_a_id: a,
            player_b_id: b,
            created_by_id: a,
            winner_id,
            validated_at: new Date(),
            xp_awarded_a: xpA,
            xp_awarded_b: xpB
          }
        }),
        prisma.user.update({
          where: { id_discord: a },
          data: {
            xp_total: { increment: xpA },
            wins: { increment: aWin ? 1 : 0 },
            losses: { increment: aWin ? 0 : 1 }
          }
        }),
        prisma.user.update({
          where: { id_discord: b },
          data: {
            xp_total: { increment: xpB },
            wins: { increment: aWin ? 0 : 1 },
            losses: { increment: aWin ? 1 : 0 }
          }
        })
      ]);

      results.push({ updatedMatch, userA, userB });
    }

    res.json({ count: results.length });
  });
}

/* =========================================================
 * ===================== ROUTES BETA =======================
 * =======================================================*/
app.get("/users/me", auth, async (req: any, res) => {
  const u = await prisma.user.findUnique({
    where: { id_discord: req.user.id_discord },
    include: { userBadges: { include: { badge: true } } }
  });
  res.json(u);
});

app.get("/users/:id", async (req, res) => {
  const u = await prisma.user.findUnique({
    where: { id_discord: req.params.id },
    select: {
      id_discord: true,
      username: true,
      avatar_url: true,
      xp_total: true,
      wins: true,
      losses: true
    }
  });
  if (!u) return res.status(404).json({ error: "user not found" });
  res.json(u);
});

/* ---------- Validations & règles métier pour les matchs ---------- */
const CreateMatchBody = z.object({
  opponent_id: z.string().min(1)
});
app.post("/matches", auth, async (req: any, res) => {
  const parsed = CreateMatchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid body" });

  const opponent_id = parsed.data.opponent_id;
  if (opponent_id === req.user.id_discord) {
    return res.status(400).json({ error: "you cannot play against yourself" });
  }

  const opponent = await prisma.user.findUnique({ where: { id_discord: opponent_id } });
  if (!opponent) return res.status(404).json({ error: "opponent not found" });

  const m = await prisma.match.create({
    data: {
      player_a_id: req.user.id_discord,
      player_b_id: opponent_id,
      created_by_id: req.user.id_discord
    }
  });
  res.json(m);
});

const ValidateMatchBody = z.object({
  winner_id: z.string().min(1)
});
app.post("/matches/:id/validate", auth, async (req: any, res) => {
  const parsed = ValidateMatchBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid body" });

  const { id } = req.params;
  const { winner_id } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) return res.status(404).json({ error: "match not found" });
  if (match.winner_id) return res.status(400).json({ error: "already validated" });

  // Seul un participant peut valider
  if (![match.player_a_id, match.player_b_id].includes(req.user.id_discord)) {
    return res.status(403).json({ error: "not a participant" });
  }
  // Par sécurité, on empêche le créateur de valider (double confirmation)
  if (req.user.id_discord === match.created_by_id) {
    return res.status(403).json({ error: "creator cannot validate" });
  }
  // winner doit être A ou B
  if (![match.player_a_id, match.player_b_id].includes(winner_id)) {
    return res.status(400).json({ error: "invalid winner" });
  }

  const aWin = winner_id === match.player_a_id;
  const xpA = aWin ? 10 : 3;
  const xpB = aWin ? 3 : 10;

  const [updatedMatch, userA, userB] = await prisma.$transaction([
    prisma.match.update({
      where: { id },
      data: { winner_id, validated_at: new Date(), xp_awarded_a: xpA, xp_awarded_b: xpB }
    }),
    prisma.user.update({
      where: { id_discord: match.player_a_id },
      data: {
        xp_total: { increment: xpA },
        wins: { increment: aWin ? 1 : 0 },
        losses: { increment: aWin ? 0 : 1 }
      }
    }),
    prisma.user.update({
      where: { id_discord: match.player_b_id },
      data: {
        xp_total: { increment: xpB },
        wins: { increment: aWin ? 0 : 1 },
        losses: { increment: aWin ? 1 : 0 }
      }
    })
  ]);

  res.json({ updatedMatch, userA, userB });
});

/* ----------------------- Leaderboard ----------------------- */
app.get("/leaderboard", async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10), 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit || "20"), 10), 1), 100);
  const skip = (page - 1) * limit;

  const [total, rows] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      orderBy: [{ xp_total: "desc" }, { wins: "desc" }],
      skip,
      take: limit,
      select: {
        id_discord: true,
        username: true,
        avatar_url: true,
        xp_total: true,
        wins: true,
        losses: true
      }
    })
  ]);

  const withRatio = rows.map((u) => ({
    ...u,
    matches: u.wins + u.losses,
    ratio: u.wins + u.losses > 0 ? Number((u.wins / (u.wins + u.losses)).toFixed(3)) : 0
  }));
  withRatio.sort((a, b) => {
    if (a.xp_total !== b.xp_total) return b.xp_total - a.xp_total;
    if (a.wins !== b.wins) return b.wins - a.wins;
    return b.ratio - a.ratio;
  });

  res.json({ page, limit, total, items: withRatio });
});

// petit /healthz pour checks
app.get("/healthz", (_req, res) => res.json({ ok: true }));

/* ----------------------- Handler d’erreurs ----------------------- */
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

/* ----------------------- Boot ----------------------- */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`));
