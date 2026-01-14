import { sql } from '@vercel/postgres';

/**
 * Database utility functions for Scrappy
 */

// Check if database is configured
export function isDatabaseConfigured() {
    return !!process.env.POSTGRES_URL;
}

// Execute a query
export async function query(queryString, params = []) {
    try {
        const result = await sql.query(queryString, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Get all sessions
export async function getSessions() {
    const result = await sql`
        SELECT * FROM sessions 
        ORDER BY updated_at DESC
    `;
    return result.rows;
}

// Get a single session with items
export async function getSession(id) {
    const sessionResult = await sql`
        SELECT * FROM sessions 
        WHERE id = ${id}
    `;

    if (sessionResult.rows.length === 0) {
        return null;
    }

    const session = sessionResult.rows[0];

    const itemsResult = await sql`
        SELECT * FROM session_items 
        WHERE session_id = ${id}
        ORDER BY created_at ASC
    `;

    return {
        ...session,
        items: itemsResult.rows
    };
}

// Create a new session
export async function createSession(sessionData) {
    const { name, sourceUrl, hostname, favicon, lastDuration, items = [] } = sessionData;

    // Insert session
    const sessionResult = await sql`
        INSERT INTO sessions (name, source_url, hostname, favicon, last_duration)
        VALUES (${name}, ${sourceUrl || null}, ${hostname || null}, ${favicon || null}, ${lastDuration || null})
        RETURNING *
    `;

    const session = sessionResult.rows[0];

    // Insert items if any
    if (items.length > 0) {
        for (const item of items) {
            await sql`
                INSERT INTO session_items (
                    session_id, title, url, description, short_description, long_description,
                    image, price, currency, brand, rating, review_count, sku, ean, stock
                )
                VALUES (
                    ${session.id}, ${item.title}, ${item.url || null}, ${item.description || null},
                    ${item.shortDescription || null}, ${item.longDescription || null},
                    ${item.image || null}, ${item.price || null}, ${item.currency || null},
                    ${item.brand || null}, ${item.rating || null}, ${item.reviewCount || null},
                    ${item.sku || null}, ${item.ean || null}, ${item.stock || null}
                )
            `;
        }
    }

    return getSession(session.id);
}

// Update a session
export async function updateSession(id, sessionData) {
    const { name, items } = sessionData;

    // Update session metadata
    await sql`
        UPDATE sessions 
        SET name = ${name}, updated_at = NOW()
        WHERE id = ${id}
    `;

    // Delete existing items
    await sql`
        DELETE FROM session_items 
        WHERE session_id = ${id}
    `;

    // Insert new items
    if (items && items.length > 0) {
        for (const item of items) {
            await sql`
                INSERT INTO session_items (
                    session_id, title, url, description, short_description, long_description,
                    image, price, currency, brand, rating, review_count, sku, ean, stock
                )
                VALUES (
                    ${id}, ${item.title}, ${item.url || null}, ${item.description || null},
                    ${item.shortDescription || null}, ${item.longDescription || null},
                    ${item.image || null}, ${item.price || null}, ${item.currency || null},
                    ${item.brand || null}, ${item.rating || null}, ${item.reviewCount || null},
                    ${item.sku || null}, ${item.ean || null}, ${item.stock || null}
                )
            `;
        }
    }

    return getSession(id);
}

// Delete a session
export async function deleteSession(id) {
    await sql`
        DELETE FROM sessions 
        WHERE id = ${id}
    `;
    return { success: true };
}

// Initialize database (create tables)
export async function initDatabase() {
    try {
        // Create sessions table
        await sql`
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                source_url TEXT,
                hostname VARCHAR(255),
                favicon TEXT,
                last_duration DECIMAL(10,2),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Create session_items table
        await sql`
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
            )
        `;

        // Create indexes
        await sql`
            CREATE INDEX IF NOT EXISTS idx_session_items_session_id ON session_items(session_id)
        `;

        await sql`
            CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC)
        `;

        console.log('✅ Database initialized successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
}
