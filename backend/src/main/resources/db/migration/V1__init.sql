-- Enable UUID generation extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Table: user_interests
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    weight VARCHAR(10) NOT NULL, -- HIGH, MEDIUM, LOW, IGNORE
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(user_id, category)
);

-- Table: content_items
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(512) NOT NULL,
    source VARCHAR(50) NOT NULL, -- YOUTUBE, REDDIT, ARTICLE, NEWS, HACKERNEWS, etc.
    content_type VARCHAR(50) NOT NULL, -- VIDEO, ARTICLE, DISCUSSION, NEWS
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    thumbnail TEXT,
    author VARCHAR(255),
    category VARCHAR(100),
    tags TEXT[],
    published_date TIMESTAMP,
    engagement_score FLOAT DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(source, external_id)
);

-- Table: user_interactions
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
    interaction VARCHAR(50) NOT NULL, -- VIEW, BOOKMARK, WATCH_LATER, READ_LATER, FAVORITE, DISMISS
    collection_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_source ON content_items(source);
CREATE INDEX IF NOT EXISTS idx_content_category ON content_items(category);
CREATE INDEX IF NOT EXISTS idx_content_published ON content_items(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_search ON content_items USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_interactions(user_id);

-- Trigger Function to update search_vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.author, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists (to avoid duplicate errors during migrations/reruns)
DROP TRIGGER IF EXISTS trg_search_vector ON content_items;

-- Trigger definition
CREATE TRIGGER trg_search_vector
BEFORE INSERT OR UPDATE ON content_items
FOR EACH ROW EXECUTE FUNCTION update_search_vector();
