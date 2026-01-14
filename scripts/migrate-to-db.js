/**
 * Migration script: JSON files → Database
 * 
 * Run this once to migrate existing sessions from file storage to database
 * Usage: node scripts/migrate-to-db.js
 */

import { getAllSessions } from '../lib/storage.js';
import { createSession, isDatabaseConfigured } from '../lib/db.js';
import fs from 'fs';
import path from 'path';

async function migrate() {
    console.log('🚀 Starting migration from JSON files to database...\n');

    // Check if database is configured
    if (!isDatabaseConfigured()) {
        console.error('❌ Database not configured!');
        console.error('Please set POSTGRES_URL in your .env.local file');
        console.error('See .env.local.example for reference');
        process.exit(1);
    }

    try {
        // Get all sessions from file storage
        const sessions = getAllSessions();
        console.log(`📁 Found ${sessions.length} sessions in file storage\n`);

        if (sessions.length === 0) {
            console.log('✅ No sessions to migrate');
            return;
        }

        // Backup existing files
        const backupDir = path.join(process.cwd(), 'data', 'sessions_backup');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        let successCount = 0;
        let errorCount = 0;

        for (const session of sessions) {
            try {
                console.log(`  Migrating: ${session.name} (${session.id})`);

                // Convert session format
                const sessionData = {
                    name: session.name,
                    sourceUrl: session.sourceUrl || null,
                    hostname: session.hostname || null,
                    favicon: session.favicon || null,
                    lastDuration: session.lastDuration || null,
                    items: session.items || []
                };

                // Create in database
                await createSession(sessionData);

                // Backup original file
                const originalFile = path.join(process.cwd(), 'data', 'sessions', `${session.id}.json`);
                const backupFile = path.join(backupDir, `${session.id}.json`);
                if (fs.existsSync(originalFile)) {
                    fs.copyFileSync(originalFile, backupFile);
                }

                successCount++;
                console.log(`    ✅ Migrated successfully`);
            } catch (error) {
                errorCount++;
                console.error(`    ❌ Error: ${error.message}`);
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`  ✅ Success: ${successCount}`);
        console.log(`  ❌ Errors: ${errorCount}`);
        console.log(`  📦 Backups saved to: ${backupDir}`);

        if (successCount > 0) {
            console.log(`\n⚠️  Original JSON files are still in data/sessions/`);
            console.log(`   You can delete them after verifying the migration was successful`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
