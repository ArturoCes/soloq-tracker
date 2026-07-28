import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

function createPrismaClient() {
  // Vercel can spin up several concurrent serverless instances for a single visitor (Next.js
  // prefetches every <Link> in the navbar on every page load), each instance opening its own
  // pool against Prisma Postgres's direct endpoint. That previously exhausted its connection
  // cap ("too many connections for role prisma_migration"). Keeping each instance's pool to a
  // single connection, released quickly when idle, keeps total concurrent connections low.
  const pool =
    globalForPrisma.pgPool ??
    new Pool({ connectionString: process.env.DATABASE_URL, max: 1, idleTimeoutMillis: 5_000 });
  if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
