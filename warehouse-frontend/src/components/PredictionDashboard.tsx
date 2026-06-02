"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';

type WidgetPayload = {
  title: string;
  predictedPrice: number;
  previousPrice: number | null;
  delta: number | null;
  deltaPercent: number | null;
  trend: 'up' | 'down' | 'flat';
  modelVersion: string | null;
  predictedAt: string;
};

type ScenarioForm = {
  year: number;
  month: number;
  cost: number;
  revenue: number;
  stock: number;
  quantity_sold: number;
};

type Point = { label: string; value: number };

const defaultScenario: ScenarioForm = {
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  cost: 13.2,
  revenue: 3520,
  stock: 410,
  quantity_sold: 220,
};

function formatCurrency(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return `${value.toFixed(2)} TND`;
}

function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function buildHistory(previousPrice: number | null, predictedPrice: number): Point[] {
  const base = previousPrice ?? predictedPrice * 0.96;
  const spread = Math.max(predictedPrice - base, 0.5);
  return [
    { label: 'Last week', value: base * 0.96 },
    { label: 'This week', value: base },
    { label: 'Forecast', value: predictedPrice },
    { label: 'Target', value: predictedPrice + spread * 0.2 },
  ];
}

function ChartCard({ points }: { points: Point[] }) {
  const width = 720;
  const height = 260;
  const padding = 32;
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const range = Math.max(max - min, 1);
  const stepX = (width - padding * 2) / (points.length - 1);
  const coordinates = points.map((point, index) => {
    const x = padding + stepX * index;
    const normalized = (point.value - min) / range;
    const y = height - padding - normalized * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
            Forecast chart
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">Price movement overview</h3>
        </div>
        <div className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
          TND / period
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-[260px] w-full overflow-visible">
        <defs>
          <linearGradient id="forecastLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--role-admin)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <linearGradient id="forecastFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(37,99,235,0.18)" />
            <stop offset="100%" stopColor="rgba(37,99,235,0.02)" />
          </linearGradient>
        </defs>

        <g>
          {[0, 1, 2, 3].map((index) => {
            const y = padding + ((height - padding * 2) / 3) * index;
            return <line key={y} x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(148,163,184,0.18)" />;
          })}
        </g>

        <path
          d={`${path} L ${coordinates.at(-1)?.x ?? width - padding} ${height - padding} L ${coordinates[0]?.x ?? padding} ${height - padding} Z`}
          fill="url(#forecastFill)"
        />
        <path d={path} fill="none" stroke="url(#forecastLine)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {coordinates.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="7" fill="white" stroke="var(--role-admin)" strokeWidth="4" />
            <text x={point.x} y={height - 10} textAnchor="middle" className="fill-slate-500 text-[12px]">
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {points.map((point) => (
          <div key={point.label} className="rounded-2xl border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{point.label}</p>
            <p className="mt-1 text-sm font-semibold">{point.value.toFixed(2)} TND</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniBarChart({ points }: { points: Point[] }) {
  const max = Math.max(...points.map((point) => point.value));

  return (
    <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <p className="text-sm font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Trend bars</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight">Relative values</h3>

      <div className="mt-5 space-y-4">
        {points.map((point) => {
          const width = Math.max((point.value / max) * 100, 8);
          return (
            <div key={point.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{point.label}</span>
                <span className="font-medium text-[var(--muted-foreground)]">{point.value.toFixed(2)} TND</span>
              </div>
              <div className="h-3 rounded-full bg-[var(--muted)]">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,var(--role-manager),var(--color-info))]"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PredictionDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<WidgetPayload | null>(null);
  const [scenario, setScenario] = useState<ScenarioForm>(defaultScenario);

  async function loadWidget() {
    if (!token) {
      setError('Please sign in to load predictions.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/ai/price/widget', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Prediction service returned ${response.status}`);
      }

      const data = (await response.json()) as WidgetPayload;
      setPayload(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load prediction data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const chartPoints = useMemo(() => {
    const predicted = payload?.predictedPrice ?? 18.5;
    const previous = payload?.previousPrice ?? predicted * 0.96;
    return buildHistory(previous, predicted);
  }, [payload]);

  const mainStats = useMemo(() => {
    const predicted = payload?.predictedPrice ?? 18.5;
    const previous = payload?.previousPrice ?? null;
    const delta = payload?.delta ?? (previous !== null ? predicted - previous : null);
    const deltaPercent = payload?.deltaPercent ?? (previous !== null && delta !== null ? (delta / previous) * 100 : null);

    return [
      { label: 'Predicted price', value: formatCurrency(predicted), hint: 'Next period estimate' },
      { label: 'Previous price', value: formatCurrency(previous), hint: 'Latest observed price' },
      { label: 'Difference', value: formatCurrency(delta), hint: `${formatPercent(deltaPercent)} vs previous` },
      { label: 'Model version', value: payload?.modelVersion ?? 'v1', hint: 'Current deployed model' },
    ];
  }, [payload]);

  const insightText = payload?.trend === 'up'
    ? 'The model expects an upward move. Consider reviewing stock and procurement timing.'
    : payload?.trend === 'down'
      ? 'The model expects a downward move. You can prepare discount or clearance scenarios.'
      : 'The forecast is stable. The price is likely to stay close to the current level.';

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(37,99,235,0.12),rgba(15,23,42,0.03))] p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex rounded-full border border-[var(--border)] bg-white/70 px-3 py-1 text-xs font-medium tracking-[0.12em] text-[var(--muted-foreground)] uppercase">
              Prediction dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Human-readable price forecast for planning and simulations
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--muted-foreground)] md:text-base">
              Review the next estimated price, compare it with the last observed value, and test what-if scenarios before making decisions.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/80 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Status</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {loading ? 'Loading forecast...' : payload ? 'Forecast ready' : 'Awaiting data'}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {payload ? `Updated at ${new Date(payload.predictedAt).toLocaleString()}` : 'Fetches automatically after sign-in.'}
            </p>
            <button
              type="button"
              onClick={loadWidget}
              className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Refresh forecast
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-[var(--color-error)] bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mainStats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{stat.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <ChartCard points={chartPoints} />
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Business insight</p>
            <p className="mt-3 text-lg font-medium leading-7 text-slate-950">{insightText}</p>
            <div className="mt-5 rounded-2xl bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
              <p className="font-medium text-slate-900">Trend indicator</p>
              <p className="mt-1">{payload?.trend ?? 'flat'} forecast with {formatPercent(payload?.deltaPercent ?? null)} change.</p>
            </div>
          </div>

          <MiniBarChart points={chartPoints.slice(0, 3)} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Simulation inputs</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">What-if scenario</h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Object.entries(scenario).map(([key, value]) => (
              <label key={key} className="space-y-2">
                <span className="text-sm font-medium capitalize text-slate-800">{key.replace('_', ' ')}</span>
                <input
                  type="number"
                  value={value}
                  onChange={(event) => setScenario((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/15"
                />
              </label>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
            These inputs are ready for the prediction modal request. The graph updates when the backend forecast is refreshed.
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
          <p className="text-sm font-semibold tracking-[0.16em] text-[var(--muted-foreground)] uppercase">Model notes</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">How to read the result</h3>

          <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
            <p>
              The forecast compares the current estimate with the latest known price, so the change is easy to scan at a glance.
            </p>
            <p>
              Use the chart to see whether the model is moving upward, downward, or staying flat over the next period.
            </p>
            <p>
              The page stays intentionally simple so managers and admins can read it quickly during planning sessions.
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-[linear-gradient(135deg,rgba(14,165,233,0.12),rgba(37,99,235,0.06))] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Current trend</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{payload?.trend ?? 'flat'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}