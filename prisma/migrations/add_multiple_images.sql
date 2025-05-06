-- AlterTable
ALTER TABLE "Design" ADD COLUMN "images" JSONB;

-- Migrate data from imageUrl to images
UPDATE "Design"
SET "images" = jsonb_build_array("imageUrl")
WHERE "imageUrl" IS NOT NULL; 