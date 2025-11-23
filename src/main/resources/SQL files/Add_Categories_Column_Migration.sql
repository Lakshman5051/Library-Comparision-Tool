-- ==========================================
-- Multi-Category Support Database Migration
-- ==========================================

-- Add categories column to library table
ALTER TABLE library
    ADD COLUMN categories VARCHAR(500);

-- Add comment explaining the field
COMMENT ON COLUMN library.categories IS 'Comma-separated list of all applicable categories for multi-category filtering';

-- Optional: Create an index if you plan to do text searches on categories
-- CREATE INDEX idx_library_categories ON library(categories);

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'library'
  AND column_name = 'categories';

-- ==========================================
-- End of Migration
-- ==========================================