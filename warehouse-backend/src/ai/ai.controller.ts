import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AiService } from './ai.service';
import { PredictPriceDto } from './dto/predict-price.dto';
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { UserRole } from '@prisma/client';


@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('price/predict')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async predict(@Body() dto: PredictPriceDto, @Req() req: any) {
    const user = req.user;
    return this.aiService.predict(dto, user);
  }

  @Get('price/health')
  async health() {
    try {
      const resp = await this.aiService.predict({
        year: 2026,
        month: 1,
        cost: 0,
        revenue: 0,
        stock: 0,
        quantity_sold: 0,
      } as PredictPriceDto);
      return { status: 'ok', inference: !!resp };
    } catch (e) {
      return { status: 'error' };
    }
  }

  @Get('price/widget')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async widget(@Req() req: any) {
    const user = req.user;
    return this.aiService.widget(user);
  }
}
