import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/Jwt.auth.guard';
import { RequestUser } from '../auth/strategies/Jwt.strategy';
import { AssistantQueryDto } from './dto/assistant-query.dto';
import { AssistantService } from './assistant.service';
import { ContextManager } from './context.manager';
import { MetricsService } from './metrics.service';

@Controller('assistant')
@UseGuards(JwtAuthGuard)
export class AssistantController {
  private readonly logger = new Logger(AssistantController.name);

  constructor(
    private readonly assistantService: AssistantService,
    private readonly contextManager: ContextManager,
    private readonly metricsService: MetricsService,
  ) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  query(@Request() req: { user: RequestUser }, @Body() dto: AssistantQueryDto) {
    // Extract userId from JWT token (sub claim typically contains user ID)
    const userId = String(req.user.sub || req.user.email);
    return this.assistantService.query(req.user.roles, userId, dto);
  }

  @Get('metrics')
  @HttpCode(HttpStatus.OK)
  getMetrics() {
    return this.metricsService.getMetricsReport(24);
  }

  @Get('metrics/performance')
  @HttpCode(HttpStatus.OK)
  getPerformanceMetrics() {
    return this.metricsService.getPerformanceStats();
  }

  @Get('metrics/failed')
  @HttpCode(HttpStatus.OK)
  getFailedQueries() {
    return this.metricsService.getFailedQueries(20);
  }

  @Get('history')
  @HttpCode(HttpStatus.OK)
  getHistory(@Request() req: { user: RequestUser }) {
    const userId = String(req.user.sub || req.user.email);
    return {
      history: this.contextManager.getConversationHistory(userId, 50),
    };
  }
}
