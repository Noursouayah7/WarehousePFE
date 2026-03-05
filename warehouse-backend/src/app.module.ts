import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { BlocModule } from './bloc/bloc.module';
import { WarehouseModule } from './warehouse/warehouse.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, WarehouseModule, BlocModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
