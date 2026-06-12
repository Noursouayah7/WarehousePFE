import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactRequestController } from './contact-request.controller';
import { ContactRequestService } from './contact-request.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContactRequestController],
  providers: [ContactRequestService],
})
export class ContactRequestModule {}
