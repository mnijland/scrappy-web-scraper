import { NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';

// Allow longer timeout for scraping operations
export const maxDuration = 300;

export async function POST(request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
        }

        const { url } = body;
        if (!url) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        // Calls the updated scraper which returns an Array
        const data = await scrapeUrl(url);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Scrape API error:', error);
        return NextResponse.json({ error: 'Scrape failed' }, { status: 500 });
    }
}
