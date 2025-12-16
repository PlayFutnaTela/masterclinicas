// Database connection - Prisma Client (optional shim)

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

// Diagnostics: log presence and host of DATABASE_URL (do not print full secret)
const _dbUrl = process.env.DATABASE_URL;
try {
  if (_dbUrl) {
    const parsed = new URL(_dbUrl);
    console.log('[DB] DATABASE_URL present:', true, 'host:', parsed.hostname, 'port:', parsed.port || 'default');
  } else {
    console.log('[DB] DATABASE_URL present: false');
  }
} catch (err) {
  console.warn('[DB] DATABASE_URL parse error:', err);
}

let _prisma: any;
try {
  // Try to require @prisma/client; if not present, use a shim that throws friendly errors
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require('@prisma/client');
  _prisma = globalForPrisma.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _prisma;
} catch (err) {
  console.warn('[DB] @prisma/client not installed - Prisma shim active');
  const shim = new Proxy({}, {
    get() {
      throw new Error('@prisma/client não está instalado. Remova usos de Prisma ou instale @prisma/client temporariamente.');
    },
  });
  _prisma = shim;
}

export const prisma = _prisma;
export const db = prisma;
export default prisma;
