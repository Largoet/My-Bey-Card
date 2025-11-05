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
- d’attribuer des points, rangs et récompenses,  
- et de synchroniser les classements sur Discord.

---

### ⚙️ Architecture prévue
| Élément | Description |
|----------|--------------|
| **Front-end** | Web App (React / Next.js) – lecture QR, gestion de profil, historique, classement. |
| **Back-end API** | Node.js (Express/NestJS) – endpoints REST sécurisés, logique XP, tournois, badges. |
| **Base de données** | PostgreSQL – tables `users`, `cards`, `matches`, `events`, `ranks`, `badges`, `audit_logs`. |
| **Bot Discord** | Discord.js – lecture read-only, commandes `/rank`, `/profile`, `/badges`, publication des classements. |
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
  - XP dégressive entre deux mêmes joueurs,
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
- **XP dégressive** sur matchs répétés avec le même adversaire.
- Reset après 15 min ou si un des deux joue contre quelqu’un d’autre.
- Plafond de matchs par jour.
- Pas de badge ni de podium.
- Idéal pour les rencontres rapides et les entraînements.

### 🏆 Mode Tournoi
- Création et validation des matchs par un admin ou arbitre.
- XP complète, classement officiel, badges et récompenses.
- Historique complet et traçabilité totale.
- Aucune dégressivité : chaque match compte pleinement.

---

## ⚖️ XP dégressive sur matchs répétés (anti-farm)

**Principe**  
Pour les **matchs amicaux**, l’XP diminue si deux mêmes joueurs s’affrontent plusieurs fois dans une courte période.  
Cela évite le farm sans bloquer les petites sessions d’entraînement.

- **Tournois** → pas de dégressivité.  
- Reset de la série si une **pause de 15 minutes** est respectée ou si un des deux affronte un autre adversaire.

**Règle**
- Fenêtre d’enchaînement : **30 minutes** (au-delà, le compteur retombe à zéro).  
- Multiplicateurs :  
  1er : ×1.00 → 2e : ×0.70 → 3e : ×0.40 → 4e : ×0.20 → 5e+ : ×0.10 (plancher).  

> Formule : `xp_final = xp_base * mode_multiplier * pair_multiplier`  
> (avec `mode_multiplier = 0.3` pour amical, `1.0` pour tournoi)

**Exemple**
- Victoire amicale = 10 XP (base), tournoi = 30 XP.  
- A et B rejouent plusieurs fois :  
  - 1er match → 3 XP  
  - 2e match → 2.1 XP  
  - 3e match → 1.2 XP  
  - 4e match → 0.6 XP  
  - 5e match → 0.3 XP  
- Après 15 min de pause ou changement d’adversaire → retour à ×1.00.

---

## 🏅 Système de récompenses (Badges & Cosmétiques)

Le système de récompenses valorise la **régularité**, la **performance** et la **fidélité**.  
Deux familles :
1. **Badges** (collection visibles sur le profil)  
2. **Cosmétiques** (cadres d’avatar, effets visuels — purement esthétiques)

### Typologie des badges (V1)
- **Victoire** : 10 / 50 / 100 / 250 / 500  
- **Matchs joués** : 20 / 100 / 250 / 500  
- **Tournois participés** : 1 / 5 / 10 / 20  
- **Podium** : Bronze / Argent / Or / Champion  
- **XP cumulée** : 500 / 1 500 / 5 000 / 10 000  
- **Anniversaire** : 1 an / 2 ans  
- **Saisonnier** (V1.5) : badges limités à une période  
- **Séries** (V1.5) : 3 / 5 / 10 victoires consécutives

### Cosmétiques (V1)
- **Cadres d’avatar** : déblocables par paliers (ex. 100 victoires = cadre Argent, 300 = Or).  
- **Effets profil** (V2) : bannières, icônes animées, fond de carte.  
> Aucun bonus en points : purement visuel.

---

## 💡 User Stories principales

### 👤 Joueur
- Je veux **créer mon compte** via Discord (pas de mot de passe).  
- Je veux **lier ma carte NFC/QR** à mon profil.  
- Je veux **scanner un adversaire** pour lancer un match amical rapidement.  
- Je veux **voir mes badges et cosmétiques**.  
- Je veux **gagner un peu d’XP** même en amical, mais moins que dans un tournoi.  

### 🧑‍⚖️ Arbitre / Staff
- Je veux **valider des matchs** sur place.  
- Je veux **voir la liste des joueurs** présents.  
- Je veux **corriger ou annuler un résultat** si erreur.  

### 👑 Admin
- Je veux **créer et paramétrer des tournois**.  
- Je veux **superviser les logs et détecter la triche**.  
- Je veux **attribuer manuellement des badges** ou les retirer.  
- Je veux **gérer les rôles** dans l’application.

---

## 🧱 Modèle de données (extrait)

### Table `users`
| Colonne | Type | Description |
|----------|------|-------------|
| `id_discord` | string | Identifiant Discord |
| `username` | string | Nom Discord |
| `avatar_url` | string | Avatar |
| `rank` | string | Rang actuel |
| `xp` | int | Expérience totale |
| `joined_at` | timestamp | Date d’inscription |

### Table `cards`
| Colonne | Type | Description |
|----------|------|-------------|
| `card_id` | uuid | Identifiant NFC/QR |
| `owner_id` | string | Réf. `users.id_discord` |
| `linked_at` | timestamp | Date de liaison |

### Table `matches`
| Colonne | Type | Description |
|----------|------|-------------|
| `id` | uuid | Identifiant |
| `player_a` | string | Joueur A |
| `player_b` | string | Joueur B |
| `winner` | string | Vainqueur |
| `type` | enum | “amical” ou “tournoi” |
| `xp_awarded` | int | Points gagnés |
| `pair_seq` | int | Rang dans la série A↔B |
| `validated_by` | string | Arbitre / staff |
| `created_at` | timestamp | Date du match |

---

## 🤖 Bot Discord
- `/rank` → rang et XP.  
- `/profile` → profil joueur.  
- `/badges` → badges récents.  
- `/leaderboard` → classement.  
- Publication automatique des résultats et nouveaux badges dans `#classements`.

---

## 🧭 Roadmap MVP

| Étape | Fonctionnalité | Objectif |
|:------|:----------------|:----------|
| **Phase 1** | Auth via Discord + profil | Base utilisateurs |
| **Phase 2** | Liaison carte NFC/QR | Identification |
| **Phase 3** | Match amical (XP réduite + dégressivité) | Test UX |
| **Phase 4** | Tournoi (validation staff) | Mode officiel |
| **Phase 5** | Récompenses (badges + cosmétiques) | Gamification |
| **Phase 6** | Bot Discord `/rank`, `/badges` | Synchronisation communauté |

---

## 🧩 Stack technique
- **Front-end** : React / Next.js + TailwindCSS + Web NFC + QR scanner.  
- **Back-end** : Node.js (Express/NestJS) + Prisma ORM + PostgreSQL.  
- **Bot Discord** : Discord.js + Axios.  
- **Auth** : Discord OAuth2 + JWT + RBAC.  
- **Infra** : Docker Compose + Caddy + GitHub Actions.

---

## 📜 Licence & philosophie
Projet open-source communautaire.  
Esprit : **fun, fair-play et créativité**.  
Pas de grind toxique ni de compétition déloyale.  
L’objectif : rendre chaque duel Beyblade encore plus vivant 🌀
