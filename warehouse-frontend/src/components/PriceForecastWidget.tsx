"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useI18n } from '@/src/i18n/I18nProvider';

type Props = { apiBase?: string };

type ForecastPayload = {
  predictedPrice: number | null;
  previousPrice?: number | null;
  delta?: number | null;
  deltaPercent?: number | null;
  trend?: 'up' | 'down' | 'flat';
  modelVersion?: string | null;
  model?: {
    name?: string | null;
    version?: string | null;
  };
  predictedAt?: string;
  featuresUsed?: ScenarioForm;
};

type ScenarioForm = {
  year: number;
  month: number;
  cost: number;
  revenue: number;
  stock: number;
  quantity_sold: number;
};

const defaultScenario: ScenarioForm = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  cost: 13.2,
  revenue: 3520,
  stock: 410,
  quantity_sold: 220,
};

const scenarioFields: Array<{
  key: keyof ScenarioForm;
  label: string;
  helper: string;
  step?: string;
}> = [
  { key: 'year', label: 'Year', helper: 'Planning period' },
  { key: 'month', label: 'Month', helper: '1 to 12' },
  { key: 'stock', label: 'Stock', helper: 'Available 1L bottles' },
  { key: 'quantity_sold', label: 'Quantity sold', helper: 'Expected 1L bottles sold' },
];

const estimatedCostRatio = 0.63;

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Not available';
  return `${value.toFixed(2)} TND / 1L bottle`;
}

function formatSignedCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Not available';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)} TND`;
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Not available';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function formatDate(value: string | undefined): string {
  if (!value) return 'Not refreshed yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not refreshed yet';
  return date.toLocaleString();
}

function getTrendCopy(payload: ForecastPayload | null, tx: (text: string) => string): {
  label: string;
  tone: string;
  insight: string;
} {
  if (!payload || payload.predictedPrice === null) {
    return {
      label: tx('Waiting for forecast'),
      tone: 'bg-[var(--muted)] text-[var(--muted-foreground)]',
      insight: tx('Connect the inference service to see the next 1L bottle price estimate.'),
    };
  }

  if (payload.trend === 'up') {
    return {
      label: tx('Price may rise'),
      tone: 'bg-[var(--tint-warning)] text-[var(--color-warning)]',
      insight: tx('A higher 1L bottle estimate can support earlier procurement or tighter stock allocation.'),
    };
  }

  if (payload.trend === 'down') {
    return {
      label: tx('Price may soften'),
      tone: 'bg-[var(--tint-info)] text-[var(--color-info)]',
      insight: tx('A lower 1L bottle estimate can help with promotion planning or slower purchasing.'),
    };
  }

  return {
    label: tx('Price looks steady'),
    tone: 'bg-[var(--tint-success)] text-[var(--color-success)]',
    insight: tx('The model does not show a strong move, so current pricing can stay under review.'),
  };
}

export default function PriceForecastWidget({ apiBase = 'http://localhost:3001' }: Props) {
  const { token } = useAuth();
  const { tx } = useI18n();
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ForecastPayload | null>(null);
  const [latestBottlePrice, setLatestBottlePrice] = useState<number | null>(null);
  const [form, setForm] = useState<ScenarioForm>(defaultScenario);

  useEffect(() => {
    if (token) {
      void refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const trend = useMemo(() => getTrendCopy(data, tx), [data, tx]);
  const modelVersion = data?.model?.version ?? data?.modelVersion ?? 'v1';
  const forecastPrice = data?.predictedPrice ?? null;
  const delta = data?.delta ?? null;
  const deltaPercent = data?.deltaPercent ?? null;
  const referenceBottlePrice = latestBottlePrice ?? forecastPrice ?? 20;
  const costEstimate = useMemo(() => {
    return Number((referenceBottlePrice * estimatedCostRatio).toFixed(2));
  }, [referenceBottlePrice]);
  const revenueEstimate = useMemo(() => {
    return Number((referenceBottlePrice * form.quantity_sold).toFixed(2));
  }, [form.quantity_sold, referenceBottlePrice]);

  async function refresh() {
    if (!token) {
      setError(tx('Sign in as an admin or manager to load the forecast.'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/ai/price/widget`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Forecast service returned ${res.status}`);
      }

      const json = (await res.json()) as ForecastPayload;
      setData(json);
      if (typeof json.previousPrice === 'number' && Number.isFinite(json.previousPrice)) {
        setLatestBottlePrice(json.previousPrice);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tx('Forecast service is unavailable.'));
    } finally {
      setLoading(false);
    }
  }

  async function runPredict() {
    if (!token) {
      setError(tx('Sign in as an admin or manager to run a scenario.'));
      return;
    }

    setPredicting(true);
    setError(null);
    try {
      const payload: ScenarioForm = {
        ...form,
        cost: costEstimate,
        revenue: revenueEstimate,
      };

      const res = await fetch(`${apiBase}/ai/price/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(body?.message || `Prediction service returned ${res.status}`);
      }

      const json = (await res.json()) as ForecastPayload;
      setData(json);
      if (typeof json.previousPrice === 'number' && Number.isFinite(json.previousPrice)) {
        setLatestBottlePrice(json.previousPrice);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tx('Prediction failed.'));
    } finally {
      setPredicting(false);
    }
  }

  function updateField(key: keyof ScenarioForm, value: string) {
    const numberValue = Number(value);
    setForm((current) => ({
      ...current,
      [key]: Number.isFinite(numberValue) ? numberValue : 0,
    }));
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
                {tx('Olive oil price forecast')}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                {tx(formatCurrency(forecastPrice))}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">
                {tx('Next-period estimate for one 1-liter bottle, used for purchase timing, stock levels, and customer pricing.')}
              </p>
            </div>

            <div className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${trend.tone}`}>
              {trend.label}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{tx('Change')}</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{tx(formatSignedCurrency(delta))}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{tx(formatPercent(deltaPercent))} {tx('per 1L bottle')}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{tx('Previous')}</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{tx(formatCurrency(data?.previousPrice))}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{tx('Latest 1L bottle price')}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{tx('Model')}</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{modelVersion}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{tx(formatDate(data?.predictedAt))}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--muted)] p-4">
            <p className="text-sm font-semibold text-slate-950">{tx('Planning note')}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{trend.insight}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={refresh}
              disabled={loading || predicting}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? tx('Refreshing...') : tx('Refresh forecast')}
            </button>
            <button
              type="button"
              onClick={runPredict}
              disabled={loading || predicting}
              className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-[var(--muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {predicting ? tx('Running scenario...') : tx('Run scenario')}
            </button>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-[var(--color-error)] bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
              {tx(error)}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              {tx('Scenario planner')}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{tx('Test a business case')}</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {scenarioFields.map((field) => (
              <label key={field.key} className="space-y-2">
                <span className="block text-sm font-medium text-slate-800">{tx(field.label)}</span>
                <input
                  type="number"
                  min={field.key === 'month' ? 1 : field.key === 'year' ? 2000 : 0}
                  max={field.key === 'month' ? 12 : field.key === 'year' ? 2100 : undefined}
                  step={field.step ?? '1'}
                  value={form[field.key]}
                  onChange={(event) => updateField(field.key, event.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:border-[var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/15"
                />
                <span className="block text-xs text-[var(--muted-foreground)]">{tx(field.helper)}</span>
              </label>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-[var(--tint-info)] p-4 text-sm leading-6 text-slate-700">
            {tx('Unit standard: one sales unit equals one 1-liter olive oil bottle. Model v1 still expects cost and revenue, so both are estimated internally instead of being entered as scenario inputs.')}
            <span className="mt-2 block font-medium text-slate-900">
              {tx('Estimated cost sent to model')}: {costEstimate.toFixed(2)} TND / 1L bottle
            </span>
            <span className="mt-2 block font-medium text-slate-900">
              {tx('Estimated revenue sent to model')}: {revenueEstimate.toFixed(2)} TND
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
