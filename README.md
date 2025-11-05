# 🌀 BeyCard – Système d’identification et de classement Beyblade Nantes

> _Un projet communautaire open-source pour organiser et gamifier les rencontres Beyblade IRL à Nantes._

---

## 🎯 Contexte

La communauté Beyblade nantaise se structure autour d’un serveur Discord.  
L’objectif de **BeyCard** est de créer un **système d’identification et de classement des joueurs**, inspiré des anciennes cartes WBBA japonaises, pour :
- Faciliter les tournois IRL.
- Valoriser la progression des joueurs.
- Donner une dimension ludique, cohérente et durable à la compétition.

Chaque joueur disposera d’une **carte physique combinant NFC + QR Code**, reliée à un **profil en ligne** synchronisé avec **Discord**.

---

## 🧾 Cahier des charges – V1 (MVP)

### 🪪 Objectif principal
Créer une application simple et fiable permettant :
- d’identifier chaque joueur via une carte NFC/QR,  
- d’enregistrer automatiquement les résultats des matchs,  
- d’attribuer des points et des rangs,  
- et de synchroniser les classements sur Discord.

---

### ⚙️ Architecture prévue
| Élément | Description |
|----------|--------------|
| **Front-end** | Web App (React / Next.js) – lecture QR, gestion de profil, historique, classement. |
| **Back-end API** | Node.js (Express/NestJS) – endpoints REST sécurisés, logique XP et tournois. |
| **Base de données** | PostgreSQL – tables `users`, `cards`, `matches`, `events`, `ranks`, `audit_logs`. |
| **Bot Discord** | Discord.js – lecture read-only, commandes `/rank`, `/profile`, publication des classements. |
| **Cartes physiques** | **NTAG213 NFC + QR Code imprimé** – même `card_id`, relié à un compte Discord. |
| **Déploiement** | Docker Compose + reverse proxy (Caddy/Nginx), auto-hébergé sur serveur Debian (Kinto Cloud). |

> ### 📱 Pourquoi NFC **et** QR ?
> Le double format (NFC + QR) permet une compatibilité complète entre Android et iOS.  
> - Sur **Android**, le NFC fonctionne nativement via Web NFC ou une application mobile, offrant une expérience fluide et rapide.  
> - Sur **iOS**, la lecture NFC depuis un navigateur est restreinte par l’OS Apple, ce qui rend l’utilisation d’un **QR code** indispensable pour garantir que tout le monde puisse être scanné.  
>
> Chaque carte BeyCard inclura donc une **puce NFC NTAG213** et un **QR Code imprimé** partageant le même identifiant unique (`card_id`).  
> Le QR pourra être scanné par n’importe quel smartphone (caméra intégrée ou web-app) pour enregistrer un match ou consulter un profil.  
>
> 🔒 **v1 :** NTAG213 + QR statique (identifiant unique)  
> 🔐 **v1.5 :** QR signé HMAC côté serveur pour plus de sécurité.

---

### 🔐 Sécurité
- Authentification via **Discord OAuth2** (aucun mot de passe local).
- Chaque carte NFC/QR contient un `card_id` unique stocké côté serveur.
- **Anti-triche** :
  - double scan (joueur A + joueur B),
  - expiration d’intention (5–10 min),
  - plafond journalier pour les matchs amicaux,
  - audit trail (horodatage, device, validateur),
  - détection d’anomalies (spam, matchs répétés, etc.).
- Tokenisation JWT + RBAC (rôles Admin / Staff / Joueur).

---

### 🧑‍💼 Rôles utilisateurs
| Rôle | Droits |
|------|---------|
| **Admin système** | Gestion BDD, sécurité, sauvegardes, bannissement, logs. |
| **Admin tournoi** | Création/édition d’événements, validation des matchs officiels. |
| **Arbitre** | Validation des matchs en tournoi, supervision sur site. |
| **Staff accueil** | Attribution et liaison des cartes NFC/QR aux joueurs. |
| **Joueur** | Consultation profil, lancement d’amicaux, confirmation de match. |

---

## 🎮 Modes de jeu

### 🕹️ Mode Amical
- Validation simplifiée : scan des deux cartes NFC ou QR + double confirmation.
- XP réduite (~30% du barème tournoi).
- Plafond de matchs par jour et cooldown entre deux mêmes joueurs.
- Pas de badge ni de podium.
- Idéal pour les rencontres rapides et les entraînements.

### 🏆 Mode Tournoi
- Création et validation des matchs par un admin ou arbitre.
- XP complète, classement officiel, badges et récompenses.
- Historique complet et traçabilité totale.

---

## 💡 User Stories principales

### 👤 En tant que **joueur**
- Je veux **créer mon compte** via Discord pour ne pas avoir à gérer un mot de passe.  
- Je veux **lier ma carte NFC/QR** à mon profil pour qu’elle me représente.  
- Je veux **scanner la carte d’un autre joueur** pour lancer un match amical rapidement.  
- Je veux **voir mon profil, mon historique et mon rang** à tout moment.  
- Je veux **gagner un peu d’XP même en amical**, mais sans que cela fausse les classements.

### 🧑‍⚖️ En tant qu’**arbitre / staff**
- Je veux pouvoir **valider les matchs amicaux ou officiels** sur place via une interface simple.  
- Je veux **voir la liste des joueurs et leur état (présent, inscrit, en attente)**.  
- Je veux **enregistrer un résultat de tournoi** en scannant simplement deux cartes.  
- Je veux **pouvoir corriger ou annuler un match** en cas d’erreur.  

### 👑 En tant qu’**admin**
- Je veux **créer/éditer des tournois**, paramétrer les barèmes de points et les badges.  
- Je veux **superviser les logs**, détecter les anomalies et bannir les tricheurs.  
- Je veux **exporter les classements et les statistiques**.  
- Je veux **gérer les rôles et permissions** dans l’application.

---

## 🧱 Modèle de données (extrait)

### Table `users`
| Colonne | Type | Description |
|----------|------|-------------|
| `id_discord` | string | Identifiant Discord (clé primaire) |
| `username` | string | Nom Discord |
| `avatar_url` | string | Avatar Discord |
| `rank` | string | Rang actuel |
| `xp` | int | Expérience totale |
| `joined_at` | timestamp | Date d’inscription |

### Table `cards`
| Colonne | Type | Description |
|----------|------|-------------|
| `card_id` | uuid | Identifiant unique NFC/QR |
| `owner_id` | string | Référence à `users.id_discord` |
| `linked_at` | timestamp | Date de liaison |
| `active` | boolean | Statut actif/inactif |

### Table `matches`
| Colonne | Type | Description |
|----------|------|-------------|
| `id` | uuid | Identifiant du match |
| `player_a` | string | Discord ID joueur A |
| `player_b` | string | Discord ID joueur B |
| `winner` | string | Discord ID du vainqueur |
| `type` | enum | “amical” ou “tournoi” |
| `xp_awarded` | int | Points gagnés |
| `validated_by` | string | ID arbitre ou staff |
| `created_at` | timestamp | Date du match |

---

## 🤖 Bot Discord
- Commandes :
  - `/rank` → affiche ton rang et ton XP.
  - `/profile` → affiche ton profil joueur.
  - `/leaderboard` → classement général ou par tournoi.
  - `/match recent` → dernières rencontres.
- Webhook automatique à chaque match validé → publication dans `#classements`.

---

## 🧭 Roadmap MVP

| Étape | Fonctionnalité | Objectif |
|:------|:----------------|:----------|
| **Phase 1** | Auth via Discord + création profil | Base utilisateurs |
| **Phase 2** | Liaison carte NFC/QR ↔ profil | Identification physique |
| **Phase 3** | Match amical (double scan + XP réduite) | Test anti-triche et UX |
| **Phase 4** | Match tournoi (validation staff + XP complète) | Mode officiel |
| **Phase 5** | Bot Discord `/rank`, `/leaderboard` | Synchronisation communauté |
| **Phase 6** | Badges, succès, statistiques | Gamification complète |

---

## 🧩 Stack technique recommandée
- **Front-end** : React / Next.js + TailwindCSS + Web NFC + QR scanner.  
- **Back-end** : Node.js (Express/NestJS) + Prisma ORM + PostgreSQL.  
- **Bot Discord** : Discord.js + Axios (API REST read-only).  
- **Auth** : Discord OAuth2 + JWT + RBAC.  
- **Infra** : Docker Compose + Caddy + GitHub Actions (CI/CD).  

---

## 🧑‍🤝‍🧑 Équipe & contributions
- **Dev Front** : interface web/mobile, intégration NFC/QR, UX.  
- **Dev Back** : API, logique XP, anti-triche, endpoints sécurisés.  
- **Bot Dev** : intégration Discord, commandes, webhooks.  
- **Designer** : visuels cartes, logo, UI/UX.  
- **Staff Orga** : testeurs, organisation tournois, retours terrain.  

---

## 📜 Licence & philosophie
Projet open-source communautaire.  
Esprit : **fun, fair-play et créativité**.  
Pas de grind toxique ni de compétition déloyale.  
L’objectif : rendre chaque duel Beyblade encore plus vivant 🌀  
