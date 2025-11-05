
Skip to content
Navigation Menu
Largoet
My-Bey-Card

Code
Issues
Pull requests
Actions
Projects
Wiki
Security
Insights

    Settings

Largoet
Largoet
authored
1 minute ago
Update Projet-Beta.md
main

1 parent 
7b8085e
 commit adc0069

File tree

    Projet-Beta.md

1 file changed
+182
-149
lines changed
 
‎Projet-Beta.md‎
+182-149Lines changed: 182 additions & 149 deletions

Original file line number	Diff line number	Diff line change
@@ -1,199 +1,232 @@
# 🧪 BEYBLADE NANTES — BETA
# 🧪 BeyCard BETA – Beyblade Nantes

> Objectif BETA : une app minimale mais utilisable en vrai.
> Connexion via Discord, profil visible, carte NFC/QR liée, scan pour lancer/valider un combat, XP + niveaux, quelques badges simples, et un bot Discord en lecture seule.
> _Une BETA communautaire pour poser les bases d’un système simple, moderne et amusant pour les joueurs Beyblade à Nantes._
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
## 🎯 Présentation & Objectif

---
La communauté Beyblade nantaise est en pleine formation : il n’existe pas encore de structure officielle pour suivre les joueurs, leurs matchs ou leurs classements.  
Le projet **BeyCard** est né de cette envie collective de créer un **outil pratique et ludique**, qui rende nos rencontres **plus immersives et organisées**.

## 🔒 Sécurité & règles (BETA)
L’idée est simple :  
➡️ chaque joueur possède une **carte BeyCard** avec **NFC + QR code**, liée à son **profil en ligne**.  
➡️ un scan de carte permet de **lancer ou valider un combat** en quelques secondes.  
➡️ chaque victoire rapporte de l’**XP**, fait progresser un **niveau**, et débloque des **badges**.  
➡️ un **bot Discord** permet de suivre les classements directement sur le serveur.

- Auth via **Discord OAuth2** → identifiant = `discord_id`.
- **Lien carte** : `card_id ↔ discord_id` stocké côté serveur.
- Combats **amicaux seulement** (pas de mode tournoi en BETA).
- Anti-abus **léger** :
  - **Double confirmation** (A & B) requise pour valider un match.
  - **Plafond** : max **10 matchs/joueur/jour** (configurable).
  - **Journal d’audit** (qui/quoi/quand).
- Pas d’XP dégressive en BETA (simplicité) — pourra être ajoutée ensuite.
**Cette version BETA** est une première étape, volontairement simple :  
le but est de **tester le concept**, d’avoir **une base stable**, et de voir comment la communauté s’en empare avant de passer à une version plus complète (tournois, effets visuels, cosmétiques, etc.).

---

## 🧮 XP & niveaux (BETA)
## 🧩 Portée de la BETA
Cette version cherche à répondre à un besoin **essentiel et concret** :
> permettre à un petit groupe de joueurs de suivre leurs combats, leur progression et leurs stats, sans dépendre d’outils externes compliqués.
### Fonctionnalités incluses :
- Connexion via **Discord OAuth2** (pas de mot de passe à créer).  
- **Profil joueur** avec :
  - photo de profil (avatar Discord ou image par défaut homme/femme),  
  - bio et deck préféré,  
  - barre d’XP et niveau,  
  - ratio victoires/défaites.  
- Liaison entre le **compte** et la **carte BeyCard** (NFC + QR).  
- Scan NFC (Android) ou QR (Android/iPhone) pour **lancer un combat**.  
- Validation d’un combat avec **double confirmation** des deux joueurs.  
- Calcul automatique de l’**XP** et du **niveau**.  
- Attribution automatique de **badges simples** (victoires, matchs joués, XP cumulée).  
- **Bot Discord** capable de lire la base de données (en lecture seule) :
  - `/rank` : ton niveau et ton XP,  
  - `/profile` : ton profil,  
  - `/leaderboard` : le classement général.
---

Règles simples, lisibles, et fun :
## 📍 Pourquoi une BETA ?

- **Gains** :
  - Victoire : **+10 XP**
  - Défaite : **+3 XP**
- **Niveaux** (progression linéaire) :
  - `level = floor(total_xp / 100) + 1`
  - **Barre d’XP** affiche `total_xp % 100 / 100`
- **Cote (ratio)** :
  - `wins`, `losses`, `ratio = wins / (wins + losses)` (arrondi 2 décimales)
- Pour **valider la mécanique de base** (scan → combat → XP → classement).  
- Pour **tester l’équilibre des points** et la logique d’XP avant d’aller plus loin.  
- Pour **simplifier la vie des joueurs** en tournoi ou en rencontre libre.  
- Et surtout, pour **impliquer la communauté locale** dans la création de son propre outil.

> Ces chiffres sont des valeurs par défaut BETA (seeds). On les ajustera après retours.
L’objectif n’est pas de sortir une app parfaite, mais une **base fonctionnelle**, évolutive et amusante à utiliser ensemble.

---

## 🧑‍💻 Rôles (BETA)
## 🧱 Fonctionnalités détaillées

- **Admin système** : gestion utilisateurs, reset mot de passe (s’il y en avait un jour), suppression de matchs frauduleux, exports.
- **Joueur** : tout le reste (profil, lien carte, lancer/valider combats, voir stats).
- **Pas** de staff arbitre / tournoi en BETA (on va à l’essentiel).
### 👤 Profil joueur
- Connexion avec Discord.  
- Photo de profil (avatar Discord ou image par défaut homme/femme).  
- Bio personnalisable.  
- Deck préféré.  
- Barre d’XP avec niveau.  
- Statistiques : victoires, défaites, ratio.  
- QR code personnel affiché dans le profil (identifiant unique).  
### 🪪 Carte BeyCard
- Carte physique avec **NFC NTAG213 + QR code imprimé**.  
- Liée au compte via un scan unique (sécurisé côté serveur).  
- Permet de lancer un combat en scannant la carte adverse.  
- QR indispensable pour les utilisateurs **iOS** (Safari ne supporte pas Web NFC).

---

## 🧱 Modèle de données (minimal)
## ⚔️ Combats (Amicaux uniquement en BETA)

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
1. **Joueur A** crée une intention de combat via scan NFC ou QR.  
2. **Joueur B** scanne à son tour → la rencontre est reconnue.  
3. Les deux joueurs valident le résultat (vainqueur).  
4. L’XP et les stats sont mises à jour automatiquement.  

### `cards`
- `card_id` (pk, uuid/string) — NFC & QR partagent cet ID
- `owner_id` (fk → users.id_discord)
- `linked_at` (timestamp)
- `active` (bool, default true)
🧩 **Règles XP BETA** :
- Victoire → +10 XP  
- Défaite → +3 XP  
- 100 XP = 1 niveau  
- Ratio affiché dans le profil (`victoires / total matchs`)  
- Pas encore d’XP dégressive (trop lourd pour le moment)

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
---

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
## 🏅 Récompenses (BETA)
Un premier système de **badges automatiques** est inclus pour motiver la progression.
### Badges disponibles :
| Type | Niveaux |
|------|----------|
| Victoires | 10 / 50 |
| Matchs joués | 20 / 100 |
| XP cumulée | 500 / 1500 |
| Premier combat | 1 |
Pas encore d’effets visuels ou de cosmétiques (cadres d’avatar, bannières).  
Les badges sont visibles sur le profil et annoncés sur Discord.

---

## 🌐 API minimale (BETA)
## 🤖 Bot Discord (lecture seule)

**Auth**
- `GET /auth/discord/callback` → session utilisateur (token)  
  _Le front stocke un token httpOnly pour requêtes auth._
Le bot lit la base de données (API REST read-only).  
Commandes disponibles :
- `/rank` → ton niveau, XP, ratio.  
- `/profile` → ton profil joueur.  
- `/leaderboard` → classement global.  

**Profil**
- `GET /me` → profil (xp, niveau, stats, badges, card_id s’il existe, QR user)
- `PATCH /me` → maj `bio`, `fav_deck`, `photo_url` (optionnelle)
Publication automatique du classement hebdomadaire dans `#classements`.

**Cartes**
- `POST /cards/link` `{ card_id }` → associe la carte scannée (NFC/QR) à l’utilisateur courant  
- `GET /me/qrcode` → payload QR **user** (ex: `user:{discord_id}` signé serveur)
---
## 🧩 Modèle de données simplifié

**Matchs**
- `POST /matches/intend` `{ opponent_card_or_qr }` → crée une intention de match (temporaire: 10 min)
- `POST /matches/confirm` `{ match_id, winner_id }` → double confirmation (requiert que **les deux** valident)
- (Server) à la validation : calcule XP, MAJ wins/losses, attribue badges puis crée le record.
### `users`
| Colonne | Type | Description |
|----------|------|-------------|
| `id_discord` | string | Identifiant Discord |
| `username` | string | Nom Discord |
| `avatar_url` | string | Avatar Discord |
| `photo_url` | string | Photo perso ou par défaut |
| `bio` | string | Texte de profil |
| `fav_deck` | string | Toupie ou combo préféré |
| `xp_total` | int | Expérience totale |
| `wins` | int | Nombre de victoires |
| `losses` | int | Nombre de défaites |
| `created_at` | timestamp | Date d’inscription |

**Classement**
- `GET /leaderboard` → top joueurs (xp_total, wins, ratio)
### `cards`
| Colonne | Type | Description |
|----------|------|-------------|
| `card_id` | uuid | Identifiant unique NFC/QR |
| `owner_id` | string | Réf. `users.id_discord` |
| `linked_at` | timestamp | Date de liaison |

**Badges**
- `GET /badges` → liste badges disponibles + statut (owned / not)
### `matches`
| Colonne | Type | Description |
|----------|------|-------------|
| `id` | uuid | Identifiant |
| `player_a` | string | Discord ID joueur A |
| `player_b` | string | Discord ID joueur B |
| `winner` | string | Discord ID vainqueur |
| `xp_awarded_a` | int | XP joueur A |
| `xp_awarded_b` | int | XP joueur B |
| `validated_at` | timestamp | Validation match |
| `created_by` | string | Créateur du match |

> **Bot Discord** : utilise uniquement `GET /leaderboard`, `GET /users/:id`, `GET /badges/:user` (endpoints **read-only**).
### `badges`
| Colonne | Type | Description |
|----------|------|-------------|
| `id` | uuid | Identifiant badge |
| `slug` | text | Exemple : `wins_10` |
| `name` | text | Nom du badge |
| `rule` | jsonb | Condition d’attribution |
| `icon_url` | text | Icône du badge |
| `active` | bool | Badge actif ou non |

---

## 🤖 Bot Discord (read-only)
## 🧮 XP & Niveaux

Commandes :
- `/rank` → rang (niveau), XP actuelle, ratio W/L
- `/profile` → pseudo + lien profil web
- `/leaderboard` → top 10 global
- (Optionnel) Publication hebdo automatique du classement dans `#classement`
- Base XP : victoire +10 / défaite +3  
- Passage de niveau tous les **100 XP**  
- Niveau affiché sur le profil et dans `/rank`  
- Pas d’XP dégressive en BETA (trop peu de joueurs pour l’instant)

**Sécurité bot** :  
Le bot ne possède **que** une clé **read-only** (pas d’écriture).  
Idéalement, il consomme une **API publique** dédiée lecture.
---
## 🧠 Stack technique (BETA)
- **Front-end** : Next.js + Tailwind + lecteur QR + Web NFC (Android)  
- **Back-end** : Node.js (Express) + Prisma + PostgreSQL  
- **Auth** : Discord OAuth2 + JWT  
- **Bot Discord** : Discord.js (lecture seule)  
- **Déploiement** : Docker Compose + Caddy/Nginx + hébergement Kinto Cloud  

---

## 📱 UX de base (flow BETA)
## 🗓️ Étapes suivantes
| Étape | Fonctionnalité | Objectif |
|:------|:----------------|:----------|
| **BETA** | Profil, XP, badges, scans, bot lecture seule | Base testable |
| **V1** | Anti-farm, tournois, rôles staff | Encadrement |
| **V2** | Cosmétiques, effets visuels, statistiques avancées | Gamification complète |
---

1) **Connexion** → “Se connecter avec Discord”.  
2) **Profil** → on voit pseudo + avatar Discord, **photo de profil** par défaut *(homme/femme)* si pas de photo perso, bio & deck éditables, barre d’XP, niveau, stats W/L, QR de l’utilisateur.  
3) **Lier carte** → “Scanner NFC ou QR” → envoie `card_id` au serveur → carte liée.  
4) **Lancer un combat** → “Nouveau match” → scanne la carte/QR de l’adversaire → intention créée.  
5) **Valider** → choisir le vainqueur → **double confirmation** (chacun confirme).  
6) **Résultat** → XP + W/L mis à jour, badges éventuels attribués.  
7) **Discord** → `/rank` ou `/leaderboard` pour vérifier.
## 🚀 Vision pour la **Version 1**
Une fois la BETA validée et stable, la **version 1** visera à transformer BeyCard en une véritable plateforme communautaire complète, en ajoutant :
### 🎯 Objectifs principaux :
- Un **mode Tournoi** complet :
  - Création d’événements (en ligne ou IRL).
  - Inscriptions, génération automatique de tableaux.
  - Saisie des résultats par les organisateurs.
  - Attribution automatique des points, XP et badges “podium”.
- Un **système de rôles** :
  - **Admin** : gestion de la base et des événements.
  - **Staff / Arbitres** : validation des matchs en tournoi.
  - **Joueurs** : accès restreint à leur profil et historique.
- Un **classement saisonnier** (reset périodique, XP + badges de saison).
- Une **interface staff** (tablette/mobile) pour enregistrer rapidement les résultats sur place.
- Des **tableaux dynamiques** visibles sur Discord et sur l’application.
- L’arrivée d’un **système anti-farm évolué** (XP dégressive, cooldown par adversaire).
- Un **panneau d’administration** simplifié (gestion des joueurs, badges, stats).
- Et à terme, un mode **multi-ligue** pour gérer plusieurs communautés locales (ex : Nantes, Rennes, Paris).
Cette version 1 fera de BeyCard **un outil clé pour la scène Beyblade francophone**, toujours open-source, transparent et centré sur la passion du jeu.

---

## 🧰 Stack recommandée (simple)
## 📜 Philosophie

- **Front** : Next.js + Tailwind + lecteur **QR** (lib) + **Web NFC** (Android)  
- **Back** : Node.js (Express) + **Prisma** + PostgreSQL  
- **Auth** : Discord OAuth2 + JWT (httpOnly)  
- **Bot** : Discord.js (read-only)  
- **Infra** : Docker Compose + Caddy/Nginx (reverse proxy)
**BeyCard** est avant tout un projet communautaire, conçu **par et pour les joueurs**.  
Il vise à créer une expérience fluide et conviviale :  
un outil simple qui transforme nos sessions Beyblade en moments fun, suivis et gratifiants.  
Chaque scan, chaque victoire, chaque badge renforce l’univers et la cohésion de notre communauté locale 🌀  

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
**Statut actuel : BETA interne – novembre 2025**
0 commit comments
Comments
0 (0)

You're not receiving notifications from this thread.
Update Projet-Beta.md · Largoet/My-Bey-Card@adc0069
