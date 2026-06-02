import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { PredictPriceDto } from './dto/predict-price.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private inferenceUrl = process.env.AI_INFERENCE_URL || 'http://localhost:8000';

  constructor(private readonly prisma: PrismaService) {}

  async predict(dto: PredictPriceDto, user?: { id?: number; roles?: any }) {
    const timeout = parseInt(process.env.AI_INFERENCE_TIMEOUT_MS || '1500', 10);
    try {
      const url = (process.env.AI_INFERENCE_URL || 'http://localhost:8000').replace(/\/$/, '') + '/predict';
      const resp = await axios.post(url, dto, { timeout }) as any;

      const predictedPrice = resp.data?.predictedPrice ?? null;
      const modelName = resp.data?.modelName ?? null;
      const modelVersion = resp.data?.modelVersion ?? null;

      // persist log (best-effort)
      try {
        await this.prisma.pricePredictionLog.create({
          data: {
            userId: user?.id ?? null,
            role: user?.roles ?? 'PENDING',
            input: dto as any,
            predictedPrice: predictedPrice ?? 0,
            modelVersion: modelVersion ?? null,
          },
        });
      } catch (err) {
        // swallow logging errors
        console.warn('Failed to log prediction', err?.message || err);
      }

      return {
        predictedPrice,
        currency: 'TND',
        model: { name: modelName, version: modelVersion },
        featuresUsed: dto,
        predictedAt: new Date().toISOString(),
      };
    } catch (e) {
      throw new HttpException('Inference service error', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async widget(user?: { id?: number; roles?: any }) {
    // attempt to build features from DB: use latest product price as previousPrice
    let previousPrice: number | null = null;
    try {
      const prod = await this.prisma.product.findFirst({ orderBy: { updatedAt: 'desc' } });
      if (prod) previousPrice = prod.price;
    } catch (err) {
      // ignore
    }

    const dto: PredictPriceDto = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      cost: 0,
      revenue: 0,
      stock: 0,
      quantity_sold: 0,
    } as PredictPriceDto;

    const prediction = await this.predict(dto, user);

    const predictedPrice = prediction.predictedPrice as number;
    const delta = previousPrice !== null ? (predictedPrice as number) - previousPrice : null;
    const deltaPercent = previousPrice !== null && delta !== null ? (delta / previousPrice) * 100 : null;
    const trend = delta === null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';

    return {
      title: 'Next Price Forecast',
      predictedPrice,
      previousPrice,
      delta,
      deltaPercent,
      trend,
      modelVersion: prediction.model?.version ?? null,
      predictedAt: prediction.predictedAt,
    };
  }
}
