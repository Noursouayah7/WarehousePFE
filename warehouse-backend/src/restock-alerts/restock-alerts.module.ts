import { Module } from '@nestjs/common';
import { RestockAlertsController } from './restock-alerts.controller';
import { RestockAlertsService } from './restock-alerts.service';

@Module({
  controllers: [RestockAlertsController],
  providers: [RestockAlertsService],
  exports: [RestockAlertsService],
})
export class RestockAlertsModule {}