import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { IntentEngine } from './intent.engine';
import { SynonymEngine } from './synonym.engine';
import { ContextManager } from './context.manager';
import { MetricsService } from './metrics.service';

@Module({
  imports: [PrismaModule],
  controllers: [AssistantController],
  providers: [
    AssistantService,
    IntentEngine,
    SynonymEngine,
    ContextManager,
    MetricsService,
  ],
  exports: [MetricsService],
})
export class AssistantModule {}
