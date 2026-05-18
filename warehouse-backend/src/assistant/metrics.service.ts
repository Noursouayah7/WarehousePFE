import { Injectable, Logger } from '@nestjs/common';
import type { AssistantIntent } from './intent.engine';

export interface QueryMetric {
  id: string;
  userId: string;
  userRole: string;
  query: string;
  intent: AssistantIntent;
  success: boolean;
  resultCount: number;
  responseTime: number; // in milliseconds
  timestamp: Date;
  extractedEntities: {
    product?: string;
    warehouse?: string;
    bloc?: string;
    order?: string;
  };
}

export interface MetricsReport {
  totalQueries: number;
  queriesByIntent: Record<AssistantIntent, number>;
  queriesByRole: Record<string, number>;
  successRate: number;
  averageResponseTime: number;
  topProducts: Array<{ name: string; count: number }>;
  topWarehouses: Array<{ name: string; count: number }>;
  topBlocs: Array<{ name: string; count: number }>;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metrics: QueryMetric[] = [];

  /**
   * Record a query metric
   */
  recordQuery(metric: Omit<QueryMetric, 'id' | 'timestamp'>): void {
    const id = `${metric.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.metrics.push({
      ...metric,
      id,
      timestamp: new Date(),
    });

    // Keep only last 10000 metrics in memory (rotate)
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000);
    }

    this.logger.debug(`Recorded metric: ${metric.intent} for user ${metric.userId} (${metric.responseTime}ms)`);
  }

  /**
   * Get metrics report for a time period
   */
  getMetricsReport(hours: number = 24): MetricsReport {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const filteredMetrics = this.metrics.filter((m) => m.timestamp >= since);

    const queriesByIntent: Record<AssistantIntent, number> = {
      stock_quantity: 0,
      stock_check: 0,
      inventory_summary: 0,
      product_location: 0,
      low_stock: 0,
      order_status: 0,
      warehouse_capacity: 0,
      clarification: 0,
      unsupported: 0,
      forbidden: 0,
    };

    const queriesByRole: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    const warehouseCounts: Record<string, number> = {};
    const blocCounts: Record<string, number> = {};
    let successCount = 0;
    let totalResponseTime = 0;

    for (const metric of filteredMetrics) {
      queriesByIntent[metric.intent]++;
      queriesByRole[metric.userRole] = (queriesByRole[metric.userRole] || 0) + 1;

      if (metric.success) {
        successCount++;
      }

      totalResponseTime += metric.responseTime;

      // Track entity usage
      if (metric.extractedEntities.product) {
        productCounts[metric.extractedEntities.product] =
          (productCounts[metric.extractedEntities.product] || 0) + 1;
      }
      if (metric.extractedEntities.warehouse) {
        warehouseCounts[metric.extractedEntities.warehouse] =
          (warehouseCounts[metric.extractedEntities.warehouse] || 0) + 1;
      }
      if (metric.extractedEntities.bloc) {
        blocCounts[metric.extractedEntities.bloc] = (blocCounts[metric.extractedEntities.bloc] || 0) + 1;
      }
    }

    return {
      totalQueries: filteredMetrics.length,
      queriesByIntent,
      queriesByRole,
      successRate: filteredMetrics.length > 0 ? successCount / filteredMetrics.length : 0,
      averageResponseTime:
        filteredMetrics.length > 0 ? totalResponseTime / filteredMetrics.length : 0,
      topProducts: this.getTopEntities(productCounts, 10),
      topWarehouses: this.getTopEntities(warehouseCounts, 10),
      topBlocs: this.getTopEntities(blocCounts, 10),
    };
  }

  /**
   * Get most common queries by user role
   */
  getTopIntentsByRole(role: string, limit: number = 5): Array<{ intent: AssistantIntent; count: number }> {
    const intentCounts: Record<AssistantIntent, number> = {
      stock_quantity: 0,
      stock_check: 0,
      inventory_summary: 0,
      product_location: 0,
      low_stock: 0,
      order_status: 0,
      warehouse_capacity: 0,
      clarification: 0,
      unsupported: 0,
      forbidden: 0,
    };

    for (const metric of this.metrics) {
      if (metric.userRole === role) {
        intentCounts[metric.intent]++;
      }
    }

    return Object.entries(intentCounts)
      .map(([intent, count]) => ({ intent: intent as AssistantIntent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    avg: number;
  } {
    if (this.metrics.length === 0) {
      return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, avg: 0 };
    }

    const responseTimes = this.metrics.map((m) => m.responseTime).sort((a, b) => a - b);
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    return {
      min: responseTimes[0],
      max: responseTimes[responseTimes.length - 1],
      avg,
      p50: responseTimes[Math.floor(responseTimes.length * 0.5)],
      p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
    };
  }

  /**
   * Get failed queries (clarification or unsupported)
   */
  getFailedQueries(limit: number = 20): QueryMetric[] {
    return this.metrics
      .filter((m) => m.intent === 'clarification' || m.intent === 'unsupported' || !m.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.logger.log('All metrics cleared');
  }

  /**
   * Export metrics to JSON (for logging/analysis)
   */
  exportMetrics(hours: number = 24): QueryMetric[] {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp >= since);
  }

  /**
   * Helper: Get top entities by count
   */
  private getTopEntities(
    counts: Record<string, number>,
    limit: number,
  ): Array<{ name: string; count: number }> {
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}
