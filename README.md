# 🪪 My Bey Card BETA – Beyblade Nantes

> _Une BETA communautaire pour poser les bases d’un système simple, moderne et amusant pour les joueurs Beyblade à Nantes._

---

## 🎯 Présentation & Objectif

La communauté Beyblade Nantaise étant en formation : il n’existe pas encore de structure officielle pour suivre les joueurs, leurs matchs ou leurs classements.  
Le projet **BeyCard** est né de cette envie collective de créer un **outil pratique et ludique**, qui rende nos rencontres **plus immersives et organisées**.

L’idée est simple :  
➡️ chaque joueur possède une **carte BeyCard** avec **NFC + QR code**, liée à son **profil en ligne**.  
➡️ un scan de carte permet de **lancer ou valider un combat** en quelques secondes.  
➡️ chaque victoire rapporte de l’**XP**, fait progresser un **niveau**, et débloque des **badges**.  
➡️ un **bot Discord** permet de suivre les classements directement sur le serveur.

**Cette version BETA** est une première étape, volontairement simple :  
le but est de **tester le concept**, d’avoir **une base stable**, et de voir comment la communauté s’en empare avant de passer à une version plus complète (tournois, effets visuels, cosmétiques, etc.).

---

## 🧩 Portée de la BETA

Cette version cherche à répondre à un besoin **essentiel et concret** :
> permettre à un petit groupe de joueurs de suivre leurs combats, leur progression et leurs stats, sans dépendre d’outils externes compliqués.

### Fonctionnalités incluses :
- Connexion via **Discord OAuth2** (pas de mot de passe à créer).  
- **Profil joueur** avec :
  - photo de profil discord,
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

## 📍 Pourquoi une BETA ?

- Pour **valider la mécanique de base** (scan → combat → XP → classement).  
- Pour **tester l’équilibre des points** et la logique d’XP avant d’aller plus loin.  
- Pour **simplifier la vie des joueurs** en tournoi ou en rencontre libre.  
- Et surtout, pour **impliquer la communauté locale** dans la création de son propre outil.

L’objectif n’est pas de sortir une app parfaite, mais une **base fonctionnelle**, évolutive et amusante à utiliser ensemble.

---

## 🧱 Fonctionnalités détaillées

### 👤 Profil joueur
- Connexion avec Discord.  
- Photo de profil.  
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

## ⚔️ Combats (Amicaux uniquement en BETA)

1. **Joueur A** crée une intention de combat via scan NFC ou QR.  
2. **Joueur B** scanne à son tour → la rencontre est reconnue.  
3. Les deux joueurs valident le résultat (vainqueur).  
4. L’XP et les stats sont mises à jour automatiquement.  

🧩 **Règles XP BETA** :
- Victoire → +10 XP  
- Défaite → +3 XP  
- 100 XP = 1 niveau  
- Ratio affiché dans le profil (`victoires / total matchs`)  
- Pas encore d’XP dégressive (trop lourd pour le moment)

---

## 🏅 Récompenses (BETA)

Un premier système de **badges automatiques** est inclus pour motiver la progression.

### Badges disponibles :
| Type | Niveaux |
|------|----------|
| Victoires | 10 / 50 /100 |
| Matchs joués | 10 / 25 / 50 / 100 |
| XP cumulée | 100 / 500 / 1000|
| Premier combat | 1 |

Pas encore d’effets visuels ou de cosmétiques (cadres d’avatar, bannières).  
Les badges sont visibles sur le profil et annoncés sur Discord.

---

## 🤖 Bot Discord (lecture seule)

Le bot lit la base de données (API REST read-only).  
Commandes disponibles :
- `/rank` → ton niveau, XP, ratio.  
- `/profile` → ton profil joueur.  
- `/leaderboard` → classement global.  

Publication automatique du classement hebdomadaire dans `#classements`.

---

## 🧩 Modèle de données simplifié

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

### `cards`
| Colonne | Type | Description |
|----------|------|-------------|
| `card_id` | uuid | Identifiant unique NFC/QR |
| `owner_id` | string | Réf. `users.id_discord` |
| `linked_at` | timestamp | Date de liaison |

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

## 🧮 XP & Niveaux

- Base XP : victoire +10 / défaite +5  
- Passage de niveau tous les **100 XP**  
- Niveau affiché sur le profil et dans `/rank`  
- Pas d’XP dégressive en BETA (trop peu de joueurs pour l’instant)

---

## 🧠 Stack technique (BETA)

- **Front-end** : Next.js + Tailwind + lecteur QR + Web NFC (Android)  
- **Back-end** : Node.js (Express) + Prisma + PostgreSQL  
- **Auth** : Discord OAuth2 + JWT  
- **Bot Discord** : Discord.js (lecture seule)  
- **Déploiement** : Docker Compose + Caddy/Nginx + hébergement Kinto Cloud  

---

## 🗓️ Étapes suivantes

| Étape | Fonctionnalité | Objectif |
|:------|:----------------|:----------|
| **BETA** | Profil, XP, badges, scans, bot lecture seule | Base testable |
| **V1** | Anti-farm, tournois, rôles staff | Encadrement |
| **V2** | Cosmétiques, effets visuels, statistiques avancées | Gamification complète |

---

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

## 📜 Philosophie

**BeyCard** est avant tout un projet communautaire, conçu **par et pour les joueurs**.  
Il vise à créer une expérience fluide et conviviale :  
un outil simple qui transforme nos sessions Beyblade en moments fun, suivis et gratifiants.  
Chaque scan, chaque victoire, chaque badge renforce l’univers et la cohésion de notre communauté locale 🌀  

---

**Statut actuel : BETA interne – novembre 2025**
