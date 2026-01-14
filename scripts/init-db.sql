-- Scrappy Database Schema
-- PostgreSQL

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_url TEXT,
    hostname VARCHAR(255),
    favicon TEXT,
    last_duration DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Session items table
CREATE TABLE IF NOT EXISTS session_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    description TEXT,
    short_description TEXT,
    long_description TEXT,
    image TEXT,
    price VARCHAR(50),
    currency VARCHAR(10),
    brand VARCHAR(255),
    rating VARCHAR(50),
    review_count VARCHAR(50),
    sku VARCHAR(255),
    ean VARCHAR(255),
    stock VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_items_session_id ON session_items(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);
