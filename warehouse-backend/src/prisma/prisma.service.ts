import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    if (!connectionString) {
      // warn so app can start even without a database (common in tests/dev)
      console.warn('DATABASE_URL missing; skipping DB connection');
    }
    super({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      this.logger.warn('Prisma connection failed', error?.message || error);
      // swallow so server can start
    }
  }
}