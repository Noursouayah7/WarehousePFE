"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';

type Props = { apiBase?: string };

export default function PriceForecastWidget({ apiBase = 'http://localhost:3001' }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ year: 2026, month: 1, cost: 0, revenue: 0, stock: 0, quantity_sold: 0 });

  useEffect(() => {
    if (token) {
      void refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/ai/price/widget`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  async function runPredict() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/ai/price/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Prediction failed');
      }
      const json = await res.json();
      setData(json);
      setShowModal(false);
    } catch (err: any) {
      setError(err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Next Price Forecast</h3>
        <div>
          <button onClick={refresh} className="mr-2">Refresh</button>
          <button onClick={() => setShowModal(true)}>Run Simulation</button>
        </div>
      </div>
      {!token && <div className="mt-2 text-sm text-[var(--muted-foreground)]">Sign in to load price forecasts.</div>}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {data && (
        <div className="mt-3">
          <div>Predicted: {data.predictedPrice}</div>
          <div>Model: {data.model?.version || data.modelVersion}</div>
          <div>Updated: {data.predictedAt || data.predictedAt}</div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="bg-white p-4 rounded w-96">
            <h4 className="font-semibold">Predict Price</h4>
            <div className="space-y-2 mt-2">
              {Object.keys(form).map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <label className="capitalize mr-2" htmlFor={k}>{k}</label>
                  <input id={k} value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} className="border p-1 w-32" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowModal(false)} className="mr-2">Cancel</button>
              <button onClick={runPredict}>Run</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
