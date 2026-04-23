-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Words table
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  word TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_words_category_id ON words(category_id);
