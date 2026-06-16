import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

type MarketUnit = 'TND_PER_LITER' | 'USD_PER_METRIC_TON' | 'USD_PER_KG' | 'EUR_PER_KG';

type ParsedMarketPrice = {
  amount: number;
  unit: MarketUnit;
};

export type MarketReferencePrice = {
  priceTndPerLiter: number;
  source: 'online' | 'env';
  sourceLabel: string;
  fetchedAt: string;
};

@Injectable()
export class MarketPriceService {
  private readonly logger = new Logger(MarketPriceService.name);
  private readonly defaultMarketUrl = 'https://data.nasdaq.com/api/v3/datasets/ODA/POLVOIL_USD.json?rows=1';
  private readonly cacheMs = this.parsePositiveInt(process.env.OLIVE_OIL_MARKET_CACHE_MS, 6 * 60 * 60 * 1000);
  private readonly timeoutMs = this.parsePositiveInt(process.env.OLIVE_OIL_MARKET_TIMEOUT_MS, 2500);
  private readonly kgPerLiter = this.parsePositiveNumber(process.env.OLIVE_OIL_KG_PER_LITER, 0.91);
  private cache: { value: MarketReferencePrice; expiresAt: number } | null = null;

  async getOliveOilReferenceTndPerLiter(): Promise<MarketReferencePrice | null> {
    const now = Date.now();
    if (this.cache && this.cache.expiresAt > now) {
      return this.cache.value;
    }

    const configuredReference = this.parsePositiveNumber(process.env.OLIVE_OIL_REFERENCE_TND_PER_LITER, 0);
    if (configuredReference > 0) {
      return this.remember({
        priceTndPerLiter: this.roundPrice(configuredReference),
        source: 'env',
        sourceLabel: 'Configured olive oil reference',
        fetchedAt: new Date().toISOString(),
      });
    }

    try {
      const parsed = await this.fetchMarketPrice();
      const priceTndPerLiter = await this.convertToTndPerLiter(parsed);

      return this.remember({
        priceTndPerLiter: this.roundPrice(priceTndPerLiter),
        source: 'online',
        sourceLabel: 'Online olive oil market reference',
        fetchedAt: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Olive oil market reference unavailable: ${message}`);
      return null;
    }
  }

  private remember(value: MarketReferencePrice): MarketReferencePrice {
    this.cache = { value, expiresAt: Date.now() + this.cacheMs };
    return value;
  }

  private async fetchMarketPrice(): Promise<ParsedMarketPrice> {
    const url = process.env.OLIVE_OIL_MARKET_PRICE_URL || this.defaultMarketUrl;
    const response = await axios.get(url, { timeout: this.timeoutMs });
    return this.parseMarketPayload(response.data);
  }

  private parseMarketPayload(payload: any): ParsedMarketPrice {
    if (typeof payload?.tndPerLiter === 'number') {
      return { amount: payload.tndPerLiter, unit: 'TND_PER_LITER' };
    }
    if (typeof payload?.usdPerMetricTon === 'number') {
      return { amount: payload.usdPerMetricTon, unit: 'USD_PER_METRIC_TON' };
    }
    if (typeof payload?.usdPerKg === 'number') {
      return { amount: payload.usdPerKg, unit: 'USD_PER_KG' };
    }
    if (typeof payload?.eurPerKg === 'number') {
      return { amount: payload.eurPerKg, unit: 'EUR_PER_KG' };
    }
    if (typeof payload?.price === 'number' && typeof payload?.unit === 'string') {
      return { amount: payload.price, unit: this.normalizeUnit(payload.unit) };
    }

    const nasdaqDatasetValue = payload?.dataset?.data?.[0]?.[1] ?? payload?.data?.[0]?.[1];
    if (typeof nasdaqDatasetValue === 'number') {
      return { amount: nasdaqDatasetValue, unit: 'USD_PER_METRIC_TON' };
    }

    throw new Error('Unsupported market price response shape');
  }

  private normalizeUnit(unit: string): MarketUnit {
    const normalized = unit.trim().toUpperCase().replace(/\s+/g, '_').replace(/\//g, '_');
    if (['TND_PER_LITER', 'TND_LITER', 'TND_L'].includes(normalized)) return 'TND_PER_LITER';
    if (['USD_PER_METRIC_TON', 'USD_METRIC_TON', 'USD_PER_MT', 'USD_MT'].includes(normalized)) return 'USD_PER_METRIC_TON';
    if (['USD_PER_KG', 'USD_KG'].includes(normalized)) return 'USD_PER_KG';
    if (['EUR_PER_KG', 'EUR_KG'].includes(normalized)) return 'EUR_PER_KG';
    throw new Error(`Unsupported market price unit: ${unit}`);
  }

  private async convertToTndPerLiter(parsed: ParsedMarketPrice): Promise<number> {
    if (parsed.unit === 'TND_PER_LITER') {
      return parsed.amount;
    }

    if (parsed.unit === 'USD_PER_METRIC_TON') {
      const usdToTnd = await this.fetchExchangeRate('USD');
      return (parsed.amount / 1000) * usdToTnd * this.kgPerLiter;
    }

    if (parsed.unit === 'USD_PER_KG') {
      const usdToTnd = await this.fetchExchangeRate('USD');
      return parsed.amount * usdToTnd * this.kgPerLiter;
    }

    const eurToTnd = await this.fetchExchangeRate('EUR');
    return parsed.amount * eurToTnd * this.kgPerLiter;
  }

  private async fetchExchangeRate(base: 'USD' | 'EUR'): Promise<number> {
    const url = process.env.OLIVE_OIL_EXCHANGE_URL || `https://open.er-api.com/v6/latest/${base}`;
    const response = await axios.get(url, { timeout: this.timeoutMs });
    const rate = response.data?.rates?.TND;
    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error(`Missing ${base}/TND exchange rate`);
    }
    return rate;
  }

  private parsePositiveInt(value: string | undefined, fallback: number): number {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private parsePositiveNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private roundPrice(value: number): number {
    return Number(value.toFixed(2));
  }
}
