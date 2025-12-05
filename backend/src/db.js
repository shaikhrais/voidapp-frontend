import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDB(env) {
    return drizzle(env.DB, { schema });
}

// Helper to generate UUIDs (Workers-compatible)
export function generateId() {
    return crypto.randomUUID();
}

// Helper for timestamps
export function now() {
    return Math.floor(Date.now() / 1000);
}
