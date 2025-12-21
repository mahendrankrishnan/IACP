import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

// Construct DATABASE_URL from individual components if available, otherwise use DATABASE_URL
const getConnectionString = (): string => {
  // If individual components are provided, use them (they take precedence)
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

  // Default fallback
  return 'postgresql://postgres:postgres@localhost:5437/ownokta';
};

const connectionString = getConnectionString();

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { max: 1 });
export const db = drizzle(client, { schema });

export { schema };

