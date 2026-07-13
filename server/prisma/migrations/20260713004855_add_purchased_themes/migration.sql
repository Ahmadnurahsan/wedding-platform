-- CreateTable
CREATE TABLE "purchased_themes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "theme_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchased_themes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchased_themes_theme_id_fkey" FOREIGN KEY ("theme_id") REFERENCES "themes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "purchased_themes_user_id_theme_id_key" ON "purchased_themes"("user_id", "theme_id");
