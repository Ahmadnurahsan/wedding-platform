-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_wishes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invitation_id" TEXT NOT NULL,
    "guest_id" TEXT,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reply" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishes_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "invitations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_wishes" ("created_at", "guest_id", "id", "invitation_id", "is_visible", "message", "name") SELECT "created_at", "guest_id", "id", "invitation_id", "is_visible", "message", "name" FROM "wishes";
DROP TABLE "wishes";
ALTER TABLE "new_wishes" RENAME TO "wishes";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
