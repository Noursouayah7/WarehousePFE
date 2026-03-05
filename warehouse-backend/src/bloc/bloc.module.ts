import { Module } from '@nestjs/common';
import { BlocService } from './bloc.service';
import { BlocController } from './bloc.controller';
import { WarehouseModule } from '../warehouse/warehouse.module';

@Module({
  imports: [WarehouseModule], // gives BlocService access to findOneWarehouse()
  controllers: [BlocController],
  providers: [BlocService],
})
export class BlocModule {}