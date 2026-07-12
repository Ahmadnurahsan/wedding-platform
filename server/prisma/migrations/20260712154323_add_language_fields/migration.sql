-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "theme_id" TEXT,
    "custom_domain" TEXT,
    "groom_name" TEXT,
    "groom_nickname" TEXT,
    "groom_parent" TEXT,
    "bride_name" TEXT,
    "bride_nickname" TEXT,
    "bride_parent" TEXT,
    "primary_color" TEXT NOT NULL DEFAULT '#D4A574',
    "secondary_color" TEXT NOT NULL DEFAULT '#F5E6D3',
    "font_family" TEXT NOT NULL DEFAULT 'serif',
    "primary_language" TEXT NOT NULL DEFAULT 'id',
    "secondary_language" TEXT DEFAULT 'en',
    "background_music" TEXT,
    "cover_enabled" BOOLEAN NOT NULL DEFAULT true,
    "cover_message" TEXT,
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "published_at" DATETIME,
    "expires_at" DATETIME,
    CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invitations_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_invitations" ("background_music", "bride_name", "bride_nickname", "bride_parent", "cover_enabled", "cover_message", "created_at", "custom_domain", "expires_at", "font_family", "groom_name", "groom_nickname", "groom_parent", "id", "primary_color", "published_at", "secondary_color", "slug", "status", "theme_id", "title", "updated_at", "user_id", "visit_count") SELECT "background_music", "bride_name", "bride_nickname", "bride_parent", "cover_enabled", "cover_message", "created_at", "custom_domain", "expires_at", "font_family", "groom_name", "groom_nickname", "groom_parent", "id", "primary_color", "published_at", "secondary_color", "slug", "status", "theme_id", "title", "updated_at", "user_id", "visit_count" FROM "invitations";
DROP TABLE "invitations";
ALTER TABLE "new_invitations" RENAME TO "invitations";
CREATE UNIQUE INDEX "invitations_slug_key" ON "invitations"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
