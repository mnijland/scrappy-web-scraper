import { NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';
import { isDatabaseConfigured, getSessions, createSession } from '@/lib/db';
import { getAllSessions, saveSession } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        // Use database if configured, otherwise fall back to file storage
        if (isDatabaseConfigured()) {
            const sessions = await getSessions();
            // Convert database format to match frontend expectations
            return NextResponse.json(sessions.map(s => ({
                id: s.id,
                name: s.name,
                sourceUrl: s.source_url,
                hostname: s.hostname,
                favicon: s.favicon,
                lastDuration: s.last_duration,
                createdAt: s.created_at,
                updatedAt: s.updated_at,
                items: [] // Items loaded separately when needed
            })));
        } else {
            const sessions = getAllSessions();
            return NextResponse.json(sessions);
        }
    } catch (error) {
        console.error('GET sessions error:', error);
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Prepare session data
        const sessionData = {
            name: body.name || 'Untitled Session',
            sourceUrl: null,
            hostname: null,
            favicon: null,
            lastDuration: null,
            items: []
        };

        // If an initial URL is provided, scrape it immediately
        if (body.url) {
            try {
                const urlObj = new URL(body.url);
                sessionData.sourceUrl = body.url;
                sessionData.hostname = urlObj.hostname;
                sessionData.favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;

                // Use hostname as default name
                if (!body.name || body.name === 'Untitled Session') {
                    sessionData.name = urlObj.hostname;
                }
            } catch (e) {
                console.error('URL parsing error:', e);
            }

            console.log(`[Session] Auto-scraping initial URL: ${body.url}`);
            const scrapedItems = await scrapeUrl(body.url);

            if (scrapedItems && scrapedItems.length > 0) {
                // Add all valid items
                const validItems = scrapedItems.filter(i => !i.error);
                sessionData.items = validItems;

                // Store duration if available
                if (scrapedItems.duration) {
                    sessionData.lastDuration = scrapedItems.duration;
                }
            }
        }

        // Use database if configured, otherwise fall back to file storage
        if (isDatabaseConfigured()) {
            const session = await createSession(sessionData);
            // Convert database format to match frontend expectations
            return NextResponse.json({
                id: session.id,
                name: session.name,
                sourceUrl: session.source_url,
                hostname: session.hostname,
                favicon: session.favicon,
                lastDuration: session.last_duration,
                createdAt: session.created_at,
                updatedAt: session.updated_at,
                items: session.items || []
            });
        } else {
            // File-based storage (backward compatibility)
            const newSession = {
                id: uuidv4(),
                ...sessionData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            saveSession(newSession);
            return NextResponse.json(newSession);
        }
    } catch (error) {
        console.error('Create session error:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
