import type { PrismaConfig } from '@prisma/client';

export default {
  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/menu_app?connection_limit=1',
  },
} satisfies PrismaConfig;
