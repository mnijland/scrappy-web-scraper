import { NextResponse } from 'next/server';
import { isDatabaseConfigured, getSession as getDbSession, updateSession as updateDbSession, deleteSession as deleteDbSession } from '@/lib/db';
import { getSession, saveSession, deleteSession as deleteFileSession } from '@/lib/storage';

export async function GET(request, { params }) {
    const { id } = await params;
    console.log(`[API] Fetching session: ${id}`);

    try {
        if (isDatabaseConfigured()) {
            const session = await getDbSession(id);
            if (!session) {
                console.error(`[API] Session ${id} not found in database.`);
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }
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
            const session = getSession(id);
            if (!session) {
                console.error(`[API] Session ${id} not found in storage.`);
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }
            return NextResponse.json(session);
        }
    } catch (error) {
        console.error('[API] Error fetching session:', error);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;

    try {
        const updates = await request.json();

        if (isDatabaseConfigured()) {
            const session = await getDbSession(id);
            if (!session) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }

            const updatedSession = await updateDbSession(id, updates);

            // Convert database format to match frontend expectations
            return NextResponse.json({
                id: updatedSession.id,
                name: updatedSession.name,
                sourceUrl: updatedSession.source_url,
                hostname: updatedSession.hostname,
                favicon: updatedSession.favicon,
                lastDuration: updatedSession.last_duration,
                createdAt: updatedSession.created_at,
                updatedAt: updatedSession.updated_at,
                items: updatedSession.items || []
            });
        } else {
            const session = getSession(id);
            if (!session) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }

            const updatedSession = { ...session, ...updates, updatedAt: new Date().toISOString() };
            saveSession(updatedSession);

            return NextResponse.json(updatedSession);
        }
    } catch (error) {
        console.error('[API] Error updating session:', error);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = await params;

    try {
        if (isDatabaseConfigured()) {
            await deleteDbSession(id);
            return NextResponse.json({ success: true });
        } else {
            const success = deleteFileSession(id);
            if (!success) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('[API] Error deleting session:', error);
        return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }
}
