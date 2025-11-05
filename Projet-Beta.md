# 🧪 BEYBLADE NANTES — BETA

> Objectif BETA : une app minimale mais utilisable en vrai.
> Connexion via Discord, profil visible, carte NFC/QR liée, scan pour lancer/valider un combat, XP + niveaux, quelques badges simples, et un bot Discord en lecture seule.

---

## 🎯 Portée BETA (scope minimal)

Fonctionnalités **utilisateur** :
- Connexion via **Discord OAuth2** (pas de mot de passe).
- **Profil** : pseudo/avatar Discord, **photo de profil** (optionnelle), **bio**, **deck préféré**.
- **Barre d’XP** + **niveau** (progression visible).
- **Cote** : victoires / défaites + **ratio**.
- **Lien carte** : associer sa **carte NFC/QR** au compte.
- **Scan NFC** (Android) **ou QR** (tous téléphones) pour **lancer un combat**.
- **Validation d’un combat** : choix du vainqueur, double confirmation A & B.
- **QR code joueur** (dans le profil) utilisable comme identifiant et imprimable sur la carte NFC.

Fonctionnalités **récompenses** (1ère passe simple) :
- **Badges de base** attribués automatiquement :
  - Victoires : 10 / 50
  - Matchs joués : 20 / 100
  - XP cumulée : 500 / 1500
  - Premier tournoi (placeholder pour plus tard)
- **Pas** d’effets visuels complexes (cadres, bannières) en BETA.

Fonctionnalités **Discord** :
- **Bot en lecture seule** : `/rank`, `/profile`, `/leaderboard` (global).
- Publication automatique du **classement hebdo** dans `#classement`.

Compatibilité **cartes** :
- Carte physique **NFC NTAG213** **+ QR code** imprimé (même `card_id`).
- **Pourquoi QR ?** iOS/Safari limite la lecture NFC en web — le QR garantit que tout le monde peut être scanné.

---

## 🔒 Sécurité & règles (BETA)

- Auth via **Discord OAuth2** → identifiant = `discord_id`.
- **Lien carte** : `card_id ↔ discord_id` stocké côté serveur.
- Combats **amicaux seulement** (pas de mode tournoi en BETA).
- Anti-abus **léger** :
  - **Double confirmation** (A & B) requise pour valider un match.
  - **Plafond** : max **10 matchs/joueur/jour** (configurable).
  - **Journal d’audit** (qui/quoi/quand).
- Pas d’XP dégressive en BETA (simplicité) — pourra être ajoutée ensuite.

---

## 🧮 XP & niveaux (BETA)

Règles simples, lisibles, et fun :

- **Gains** :
  - Victoire : **+10 XP**
  - Défaite : **+3 XP**
- **Niveaux** (progression linéaire) :
  - `level = floor(total_xp / 100) + 1`
  - **Barre d’XP** affiche `total_xp % 100 / 100`
- **Cote (ratio)** :
  - `wins`, `losses`, `ratio = wins / (wins + losses)` (arrondi 2 décimales)

> Ces chiffres sont des valeurs par défaut BETA (seeds). On les ajustera après retours.

---

## 🧑‍💻 Rôles (BETA)

- **Admin système** : gestion utilisateurs, reset mot de passe (s’il y en avait un jour), suppression de matchs frauduleux, exports.
- **Joueur** : tout le reste (profil, lien carte, lancer/valider combats, voir stats).
- **Pas** de staff arbitre / tournoi en BETA (on va à l’essentiel).

---

## 🧱 Modèle de données (minimal)

### `users`
- `id_discord` (pk, string)
- `username` (string)
- `avatar_url` (string)
- `photo_url` (string, nullable) — **photo de profil perso** (optionnelle)
- `bio` (string, nullable)
- `fav_deck` (string, nullable)
- `xp_total` (int, default 0)
- `wins` (int, default 0)
- `losses` (int, default 0)
- `created_at` (timestamp)

### `cards`
- `card_id` (pk, uuid/string) — NFC & QR partagent cet ID
- `owner_id` (fk → users.id_discord)
- `linked_at` (timestamp)
- `active` (bool, default true)

### `matches`
- `id` (pk, uuid)
- `player_a` (fk → users.id_discord)
- `player_b` (fk → users.id_discord)
- `winner` (fk → users.id_discord)
- `xp_awarded_a` (int)
- `xp_awarded_b` (int)
- `validated_at` (timestamp)
- `created_by` (string) — `player_a` ou `player_b`
- `meta` (jsonb) — device, nfc/qr, etc.

### `badges`
- `id` (pk, uuid)
- `slug` (unique) — ex: `wins_10`, `matches_20`, `xp_500`
- `name` (string)
- `rule` (jsonb) — **seeds simples** (type, metric, value)
- `icon_url` (string)
- `active` (bool)

### `user_badges`
- `user_id` (fk → users)
- `badge_id` (fk → badges)
- `earned_at` (timestamp)
- PK composite (`user_id`, `badge_id`)

---

## 🌐 API minimale (BETA)

**Auth**
- `GET /auth/discord/callback` → session utilisateur (token)  
  _Le front stocke un token httpOnly pour requêtes auth._

**Profil**
- `GET /me` → profil (xp, niveau, stats, badges, card_id s’il existe, QR user)
- `PATCH /me` → maj `bio`, `fav_deck`, `photo_url` (optionnelle)

**Cartes**
- `POST /cards/link` `{ card_id }` → associe la carte scannée (NFC/QR) à l’utilisateur courant  
- `GET /me/qrcode` → payload QR **user** (ex: `user:{discord_id}` signé serveur)

**Matchs**
- `POST /matches/intend` `{ opponent_card_or_qr }` → crée une intention de match (temporaire: 10 min)
- `POST /matches/confirm` `{ match_id, winner_id }` → double confirmation (requiert que **les deux** valident)
- (Server) à la validation : calcule XP, MAJ wins/losses, attribue badges puis crée le record.

**Classement**
- `GET /leaderboard` → top joueurs (xp_total, wins, ratio)

**Badges**
- `GET /badges` → liste badges disponibles + statut (owned / not)

> **Bot Discord** : utilise uniquement `GET /leaderboard`, `GET /users/:id`, `GET /badges/:user` (endpoints **read-only**).

---

## 🤖 Bot Discord (read-only)

Commandes :
- `/rank` → rang (niveau), XP actuelle, ratio W/L
- `/profile` → pseudo + lien profil web
- `/leaderboard` → top 10 global
- (Optionnel) Publication hebdo automatique du classement dans `#classement`

**Sécurité bot** :  
Le bot ne possède **que** une clé **read-only** (pas d’écriture).  
Idéalement, il consomme une **API publique** dédiée lecture.

---

## 📱 UX de base (flow BETA)

1) **Connexion** → “Se connecter avec Discord”.  
2) **Profil** → on voit pseudo + avatar Discord, **photo de profil** par défaut *(homme/femme)* si pas de photo perso, bio & deck éditables, barre d’XP, niveau, stats W/L, QR de l’utilisateur.  
3) **Lier carte** → “Scanner NFC ou QR” → envoie `card_id` au serveur → carte liée.  
4) **Lancer un combat** → “Nouveau match” → scanne la carte/QR de l’adversaire → intention créée.  
5) **Valider** → choisir le vainqueur → **double confirmation** (chacun confirme).  
6) **Résultat** → XP + W/L mis à jour, badges éventuels attribués.  
7) **Discord** → `/rank` ou `/leaderboard` pour vérifier.

---

## 🧰 Stack recommandée (simple)

- **Front** : Next.js + Tailwind + lecteur **QR** (lib) + **Web NFC** (Android)  
- **Back** : Node.js (Express) + **Prisma** + PostgreSQL  
- **Auth** : Discord OAuth2 + JWT (httpOnly)  
- **Bot** : Discord.js (read-only)  
- **Infra** : Docker Compose + Caddy/Nginx (reverse proxy)

---

## 🧪 Seeds BETA (exemples)

### Badges (JSON)
```json
[
  { "slug": "wins_10",     "name": "10 Victoires",   "rule": {"metric":"wins","op":">=","value":10},     "icon_url":"https://cdn/badges/wins_10.svg","active":true },
  { "slug": "wins_50",     "name": "50 Victoires",   "rule": {"metric":"wins","op":">=","value":50},     "icon_url":"https://cdn/badges/wins_50.svg","active":true },
  { "slug": "matches_20",  "name": "20 Matchs",      "rule": {"metric":"matches","op":">=","value":20},  "icon_url":"https://cdn/badges/matches_20.svg","active":true },
  { "slug": "matches_100", "name": "100 Matchs",     "rule": {"metric":"matches","op":">=","value":100}, "icon_url":"https://cdn/badges/matches_100.svg","active":true },
  { "slug": "xp_500",      "name": "500 XP",         "rule": {"metric":"xp","op":">=","value":500},      "icon_url":"https://cdn/badges/xp_500.svg","active":true },
  { "slug": "xp_1500",     "name": "1500 XP",        "rule": {"metric":"xp","op":">=","value":1500},     "icon_url":"https://cdn/badges/xp_1500.svg","active":true }
]
