import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../database/schemas';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export function useDrizzle() {
    const client = postgres(process.env.DATABASE_URL!);

    return drizzle(client, { schema });
}
