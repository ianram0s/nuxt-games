import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
    schema: './server/database/schemas',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL },
    verbose: true,
    strict: true,
    out: './server/database/migrations',
});
