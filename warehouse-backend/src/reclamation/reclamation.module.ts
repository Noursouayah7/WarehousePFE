import { Module } from '@nestjs/common';
import { ReclamationService } from './reclamation.service';
import { ReclamationController } from './reclamation.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ReclamationController],
  providers: [ReclamationService, PrismaService],
})
export class ReclamationModule {}
