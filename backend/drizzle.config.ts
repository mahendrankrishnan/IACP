import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

// Construct DATABASE_URL from individual components if available
const getConnectionString = (): string => {
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DB;
  const host = process.env.POSTGRES_HOST || process.env.DB_HOST;
  const port = process.env.POSTGRES_PORT || process.env.DB_PORT;

  // If we have the key components, construct the connection string
  if (user && password && database) {
    const dbHost = host || (process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost');
    const dbPort = port || (process.env.NODE_ENV === 'production' ? '5432' : '5437');
    return `postgresql://${user}:${password}@${dbHost}:${dbPort}/${database}`;
  }

  // Fall back to DATABASE_URL if provided
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Default fallback (for local development)
  const defaultHost = process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost';
  const defaultPort = process.env.NODE_ENV === 'production' ? '5432' : '5437';
  const defaultDb = 'iacp';
  return `postgresql://postgres:postgres@${defaultHost}:${defaultPort}/${defaultDb}`;
};

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getConnectionString(),
  },
} satisfies Config;

