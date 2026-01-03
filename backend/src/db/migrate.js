import db from './database.js';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Track applied migrations
function ensureMigrationTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
    `);
}

function getAppliedMigrations() {
    return db.prepare('SELECT name FROM _migrations').all().map(r => r.name);
}

function markMigrationApplied(name) {
    db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(name);
}

export function runMigrations() {
    ensureMigrationTable();

    const migrationsDir = path.join(__dirname, 'migrations');

    try {
        const files = readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        const applied = getAppliedMigrations();

        for (const file of files) {
            if (!applied.includes(file)) {
                console.log(`Running migration: ${file}`);
                const sql = readFileSync(path.join(migrationsDir, file), 'utf8');

                try {
                    db.exec(sql);
                    markMigrationApplied(file);
                    console.log(`  ✓ Applied: ${file}`);
                } catch (error) {
                    // If columns already exist, just mark as applied
                    if (error.message.includes('duplicate column')) {
                        markMigrationApplied(file);
                        console.log(`  ✓ Skipped (already exists): ${file}`);
                    } else {
                        console.error(`  ✗ Failed: ${file}`, error.message);
                    }
                }
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('No migrations directory found');
        } else {
            throw error;
        }
    }
}

export default { runMigrations };
