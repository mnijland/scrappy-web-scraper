import { NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';

export async function POST(request) {
    try {
        const { url } = await request.json();
        if (!url) {
            return NextResponse.json({ error: 'URL required' }, { status: 400 });
        }

        // Calls the updated scraper which returns an Array
        const data = await scrapeUrl(url);

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Scrape failed' }, { status: 500 });
    }
}
