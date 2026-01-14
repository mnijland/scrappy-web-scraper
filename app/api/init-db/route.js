import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';

/**
 * Database initialization endpoint
 * GET /api/init-db
 * 
 * Creates database tables if they don't exist
 */
export async function GET() {
    try {
        if (!process.env.POSTGRES_URL) {
            return NextResponse.json({
                error: 'Database not configured',
                message: 'Please set POSTGRES_URL in your environment variables'
            }, { status: 400 });
        }

        await initDatabase();

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully'
        });
    } catch (error) {
        console.error('Database initialization error:', error);
        return NextResponse.json({
            error: 'Failed to initialize database',
            details: error.message
        }, { status: 500 });
    }
}
