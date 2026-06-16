import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MarketPriceService } from './market-price.service';


@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, MarketPriceService],
  exports: [AiService],
})
export class AiModule {}
