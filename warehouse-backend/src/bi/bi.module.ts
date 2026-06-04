import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BiController } from './bi.controller';
import { BiService } from './bi.service';

@Module({
  imports: [PrismaModule],
  controllers: [BiController],
  providers: [BiService],
})
export class BiModule {}
