import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import postgres from 'postgres';

const connection = postgres(process.env.CONNECTION_STRING);

export const db = drizzle(connection, {schema});