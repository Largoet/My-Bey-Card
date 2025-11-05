-- CreateTable
CREATE TABLE "User" (
    "id_discord" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar_url" TEXT,
    "photo_url" TEXT,
    "bio" TEXT,
    "fav_deck" TEXT,
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_discord")
);

-- CreateTable
CREATE TABLE "Card" (
    "card_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("card_id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "player_a_id" TEXT NOT NULL,
    "player_b_id" TEXT NOT NULL,
    "winner_id" TEXT,
    "xp_awarded_a" INTEGER NOT NULL DEFAULT 0,
    "xp_awarded_b" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "validated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rule" JSONB NOT NULL,
    "icon_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Card_owner_id_idx" ON "Card"("owner_id");

-- CreateIndex
CREATE INDEX "Match_player_a_id_idx" ON "Match"("player_a_id");

-- CreateIndex
CREATE INDEX "Match_player_b_id_idx" ON "Match"("player_b_id");

-- CreateIndex
CREATE INDEX "Match_winner_id_idx" ON "Match"("winner_id");

-- CreateIndex
CREATE INDEX "Match_created_by_id_idx" ON "Match"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "Badge_slug_key" ON "Badge"("slug");

-- CreateIndex
CREATE INDEX "UserBadge_user_id_idx" ON "UserBadge"("user_id");

-- CreateIndex
CREATE INDEX "UserBadge_badge_id_idx" ON "UserBadge"("badge_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_user_id_badge_id_key" ON "UserBadge"("user_id", "badge_id");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id_discord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player_a_id_fkey" FOREIGN KEY ("player_a_id") REFERENCES "User"("id_discord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_player_b_id_fkey" FOREIGN KEY ("player_b_id") REFERENCES "User"("id_discord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "User"("id_discord") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id_discord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id_discord") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
