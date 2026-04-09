import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlocModule } from './bloc/bloc.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { ProductModule } from './product/product.module';
import { AdminModule } from './admin/admin.module';
import { OrderModule } from './order/order.module';
import { ShipmentModule } from './shipment/shipment.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    WarehouseModule,
    BlocModule,
    ProductModule,
    AdminModule,
    OrderModule,
    ShipmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
