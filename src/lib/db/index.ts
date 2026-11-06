import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __habDb?: Db;
  __habSql?: ReturnType<typeof postgres>;
};

export function getDb(): Db {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and configure Postgres."
    );
  }

  if (!globalForDb.__habDb) {
    globalForDb.__habSql = postgres(connectionString, { max: 10 });
    globalForDb.__habDb = drizzle(globalForDb.__habSql, { schema });
  }

  return globalForDb.__habDb;
}

/** Convenience alias for server code that already assumes env is loaded. */
export const db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const real = getDb();
    return Reflect.get(real, prop, receiver);
  },
});
