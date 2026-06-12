'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useI18n } from '@/src/i18n/I18nProvider';
import ManagerSectionLayout from './ManagerSectionLayout';
import AdminProductsDashbord from '@/src/admin/ProductsDashbord/AdminProductsDashbord';
import { AdminDashboardProduct, getAdminProducts } from '@/src/admin/ProductsDashbord/ProductDashbord.admin.api';
import {
  AdminDashboardWarehouse,
  getAdminWarehouses,
  WarehouseBloc,
} from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';
import { createRestockAlert } from '@/src/common/restock-alerts.api';

type RestockAlertForm = {
  productId: string;
  requestedQuantity: string;
  warehouseId: string;
  blocId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  note: string;
};

const defaultRestockAlertForm: RestockAlertForm = {
  productId: '',
  requestedQuantity: '',
  warehouseId: '',
  blocId: '',
  priority: 'MEDIUM',
  note: '',
};

function findProductLocation(product: AdminDashboardProduct, warehouses: AdminDashboardWarehouse[]) {
  for (const warehouse of warehouses) {
    const bloc = warehouse.blocks.find((item) => item.id === product.blocId);
    if (bloc) {
      return { warehouseId: warehouse.id, blocId: bloc.id };
    }
  }

  return { warehouseId: '', blocId: '' };
}

function getBlocLabel(bloc: WarehouseBloc): string {
  return `${bloc.name} · ${bloc.currentUsage}/${bloc.capacity}`;
}

export default function ManagerProductsPage() {
  const { token } = useAuth();
  const { tx } = useI18n();

  const [products, setProducts] = useState<AdminDashboardProduct[]>([]);
  const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<RestockAlertForm>(defaultRestockAlertForm);

  useEffect(() => {
    const accessToken = token;

    if (!accessToken) {
      return;
    }

    const confirmedToken = accessToken as string;

    let active = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const [productData, warehouseData] = await Promise.all([
          getAdminProducts(confirmedToken),
          getAdminWarehouses(confirmedToken),
        ]);

        if (!active) {
          return;
        }

        setProducts(productData);
        setWarehouses(warehouseData);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Failed to load products');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [token]);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === form.productId) ?? null,
    [form.productId, products],
  );

  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse) => String(warehouse.id) === form.warehouseId) ?? null,
    [form.warehouseId, warehouses],
  );

  const availableBlocs = selectedWarehouse?.blocks ?? [];

  useEffect(() => {
    if (!selectedProduct || !warehouses.length) {
      return;
    }

    const location = findProductLocation(selectedProduct, warehouses);

    if (!location.warehouseId || !location.blocId) {
      return;
    }

    setForm((current) => ({
      ...current,
      warehouseId: String(location.warehouseId),
      blocId: String(location.blocId),
    }));
  }, [selectedProduct, warehouses]);

  function openModal() {
    setError(null);
    setSuccessMessage(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setIsModalOpen(false);
    setForm(defaultRestockAlertForm);
  }

  function handleProductChange(event: ChangeEvent<HTMLSelectElement>) {
    const productId = event.target.value;
    const product = products.find((item) => String(item.id) === productId);

    if (!product) {
      setForm(defaultRestockAlertForm);
      return;
    }

    const location = findProductLocation(product, warehouses);

    setForm((current) => ({
      ...current,
      productId,
      warehouseId: location.warehouseId ? String(location.warehouseId) : current.warehouseId,
      blocId: location.blocId ? String(location.blocId) : current.blocId,
    }));
  }

  function handleWarehouseChange(event: ChangeEvent<HTMLSelectElement>) {
    const warehouseId = event.target.value;
    const warehouse = warehouses.find((item) => String(item.id) === warehouseId);

    setForm((current) => ({
      ...current,
      warehouseId,
      blocId: warehouse?.blocks[0] ? String(warehouse.blocks[0].id) : '',
    }));
  }

  function handleBlocChange(event: ChangeEvent<HTMLSelectElement>) {
    setForm((current) => ({ ...current, blocId: event.target.value }));
  }

  function handleFieldChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError('You must be signed in to send a restock alert.');
      return;
    }

    const product = products.find((item) => String(item.id) === form.productId);
    const warehouse = warehouses.find((item) => String(item.id) === form.warehouseId);
    const bloc = warehouse?.blocks.find((item) => String(item.id) === form.blocId);

    if (!product || !warehouse || !bloc) {
      setError('Please choose a product, warehouse, and bloc.');
      return;
    }

    const requestedQuantity = Number(form.requestedQuantity);

    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError('Requested quantity must be greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createRestockAlert(token, {
        productId: product.id,
        productName: product.name,
        currentStock: product.quantity,
        requestedQuantity,
        warehouseId: warehouse.id,
        blocId: bloc.id,
        priority: form.priority,
        note: form.note.trim() || undefined,
      });

      setSuccessMessage(`Restock alert sent for ${product.name}.`);
      setIsModalOpen(false);
      setForm(defaultRestockAlertForm);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to send restock alert');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ManagerSectionLayout
      title="Products"
      description="Create, update, and remove products with the same operational controls as admin."
      showHero={false}
    >
      <div className="mb-6 flex flex-col gap-4 rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--surface)] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">{tx('Inventory action')}</p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{tx('Send a restock alert')}</h2>
          <p className="max-w-2xl text-sm text-[var(--text-muted)]">
            {tx('Choose the product, quantity, and destination bloc, then send a direct alert to the technicien team.')}
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {tx('Send restock alert')}
        </button>
      </div>

      {successMessage ? (
        <div className="mb-6 rounded-2xl border border-[color:var(--border-success)] bg-[var(--tint-success)] px-4 py-3 text-sm text-[var(--color-success)]">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-2xl border border-[color:var(--border-error)] bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-[1.75rem] border border-[color:var(--border-subtle)] bg-[var(--surface)] p-8 text-sm text-[var(--text-muted)]">
          {tx('Loading inventory data...')}
        </div>
      ) : null}

      <AdminProductsDashbord />

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-md">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.32)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{tx('Restock alert')}</p>
                <h3 className="mt-1 text-2xl font-semibold text-slate-950">{tx('Send to technicien')}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {tx('Fill in the product, requested quantity, and target bloc. The current stock comes from the selected product.')}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                {tx('Close')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Product')}</span>
                  <select
                    value={form.productId}
                    onChange={handleProductChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/15"
                  >
                    <option value="">{tx('Select a product')}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Requested quantity')}</span>
                  <input
                    name="requestedQuantity"
                    type="number"
                    min="1"
                    value={form.requestedQuantity}
                    onChange={handleFieldChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/15"
                    placeholder={tx('Enter quantity')}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Warehouse')}</span>
                  <select
                    value={form.warehouseId}
                    onChange={handleWarehouseChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/15"
                  >
                    <option value="">{tx('Select a warehouse')}</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Bloc')}</span>
                  <select
                    value={form.blocId}
                    onChange={handleBlocChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/15"
                  >
                    <option value="">{tx('Select a bloc')}</option>
                    {availableBlocs.map((bloc) => (
                      <option key={bloc.id} value={bloc.id}>
                        {getBlocLabel(bloc)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Priority')}</span>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFieldChange}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/15"
                  >
                    <option value="LOW">{tx('Low')}</option>
                    <option value="MEDIUM">{tx('Medium')}</option>
                    <option value="HIGH">{tx('High')}</option>
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Current stock')}</span>
                  <input
                    type="number"
                    value={selectedProduct ? selectedProduct.quantity : ''}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                    placeholder={tx('Select a product')}
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-slate-800">{tx('Selected product')}</span>
                  <input
                    type="text"
                    value={selectedProduct?.name ?? ''}
                    readOnly
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700 outline-none"
                    placeholder={tx('Select a product')}
                  />
                </label>
              </div>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-slate-800">{tx('Note')}</span>
                <textarea
                  name="note"
                  value={form.note}
                  onChange={handleFieldChange}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color:var(--color-primary)]/15"
                  placeholder={tx('Optional message for the technicien team')}
                />
              </label>

              <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  {tx('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.28)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? tx('Sending...') : tx('Send restock alert')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </ManagerSectionLayout>
  );
}
