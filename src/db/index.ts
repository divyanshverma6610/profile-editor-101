import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Lazy, env-tolerant database client.
 *
 * Portraitify never queries a database, and this module must be safe to
 * import in environments without DATABASE_URL (e.g. a zero-config Vercel
 * deploy). The connection pool is only created on first actual use —
 * importing this file never throws.
 */

type Db = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set — configure it before querying the database."
    );
  }
  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }
  return pool;
}

let cachedDb: Db | undefined;

function getDb(): Db {
  if (!cachedDb) cachedDb = drizzle(createPool());
  return cachedDb;
}

/** Proxy that defers pool creation until the first query. */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

/** Shared pool, present only when DATABASE_URL is configured. */
export const pool: Pool | undefined = process.env.DATABASE_URL
  ? createPool()
  : undefined;
