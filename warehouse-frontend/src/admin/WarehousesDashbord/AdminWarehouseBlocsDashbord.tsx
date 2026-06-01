'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import {
  AdminDashboardWarehouse,
  BlocProduct,
  createWarehouseBloc,
  deleteWarehouseBloc,
  getBlocProducts,
  getAdminWarehouseById,
  getWarehouseBlocs,
  updateWarehouseBloc,
  WarehouseBloc,
} from './WarehouseDashbord.admin.api';

type BlocFormState = {
  name: string;
  capacity: string;
};

const emptyForm: BlocFormState = {
  name: '',
  capacity: '',
};

function toFormState(bloc: WarehouseBloc): BlocFormState {
  return {
    name: bloc.name,
    capacity: String(bloc.capacity),
  };
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString();
}

type AdminWarehouseBlocsDashbordProps = {
  warehouseId: number;
};

export default function AdminWarehouseBlocsDashbord({ warehouseId }: AdminWarehouseBlocsDashbordProps) {
  const { token } = useAuth();
  const { query } = useWorkspaceSearch();
  const [warehouse, setWarehouse] = useState<AdminDashboardWarehouse | null>(null);
  const [blocs, setBlocs] = useState<WarehouseBloc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlocId, setEditingBlocId] = useState<number | null>(null);
  const [confirmDeleteBlocId, setConfirmDeleteBlocId] = useState<number | null>(null);
  const [savingBloc, setSavingBloc] = useState(false);
  const [deletingBlocId, setDeletingBlocId] = useState<number | null>(null);
  const [form, setForm] = useState<BlocFormState>(emptyForm);
  const [productsModalBloc, setProductsModalBloc] = useState<WarehouseBloc | null>(null);
  const [blocProducts, setBlocProducts] = useState<BlocProduct[]>([]);
  const [blocProductsLoading, setBlocProductsLoading] = useState(false);
  const [blocProductsError, setBlocProductsError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = token;

    if (!accessToken) {
      setIsLoading(false);
      setError('Missing auth token. Please login again.');
      return;
    }

    const activeToken: string = accessToken;
    let isMounted = true;

    async function loadWarehouseAndBlocs() {
      setIsLoading(true);
      setError(null);

      try {
        const [warehouseData, blocsData] = await Promise.all([
          getAdminWarehouseById(activeToken, warehouseId),
          getWarehouseBlocs(activeToken, warehouseId),
        ]);

        if (isMounted) {
          setWarehouse(warehouseData);
          setBlocs(blocsData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load warehouse blocs');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadWarehouseAndBlocs();

    return () => {
      isMounted = false;
    };
  }, [token, warehouseId]);

  const blocCount = useMemo(() => blocs.length, [blocs]);
  const visibleBlocs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return blocs;
    return blocs.filter((bloc) => {
      return [
        String(bloc.id),
        bloc.name,
        String(bloc.capacity),
        String(bloc.currentUsage),
        String(bloc.warehouseId),
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [blocs, query]);
  const confirmDeleteBloc = blocs.find((bloc) => bloc.id === confirmDeleteBlocId) ?? null;
  const editingBloc = blocs.find((bloc) => bloc.id === editingBlocId) ?? null;

  function openCreateModal() {
    setEditingBlocId(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openUpdateModal(bloc: WarehouseBloc) {
    setEditingBlocId(bloc.id);
    setForm(toFormState(bloc));
    setIsFormOpen(true);
  }

  function closeFormModal() {
    if (savingBloc) {
      return;
    }
    setIsFormOpen(false);
    setEditingBlocId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const accessToken = token;
    if (!accessToken) {
      setError('Missing auth token. Please login again.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
    };

    if (!payload.name || Number.isNaN(payload.capacity) || payload.capacity <= 0) {
      setError('Please provide a valid name and a capacity greater than 0.');
      return;
    }

    setSavingBloc(true);
    setError(null);

    try {
      const result = editingBlocId
        ? await updateWarehouseBloc(accessToken, warehouseId, editingBlocId, payload)
        : await createWarehouseBloc(accessToken, warehouseId, payload);

      if (editingBlocId) {
        setBlocs((current) => current.map((bloc) => (bloc.id === editingBlocId ? result : bloc)));
      } else {
        setBlocs((current) => [result, ...current]);
      }

      setIsFormOpen(false);
      setEditingBlocId(null);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bloc');
    } finally {
      setSavingBloc(false);
    }
  }

  async function handleDeleteBloc(blocId: number) {
    const accessToken = token;
    if (!accessToken) {
      setError('Missing auth token. Please login again.');
      return;
    }

    setDeletingBlocId(blocId);
    setError(null);

    try {
      await deleteWarehouseBloc(accessToken, warehouseId, blocId);
      setBlocs((current) => current.filter((bloc) => bloc.id !== blocId));
      setConfirmDeleteBlocId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bloc');
    } finally {
      setDeletingBlocId(null);
    }
  }

  async function handleViewProducts(bloc: WarehouseBloc) {
    const accessToken = token;
    if (!accessToken) {
      setError('Missing auth token. Please login again.');
      return;
    }

    setProductsModalBloc(bloc);
    setBlocProducts([]);
    setBlocProductsError(null);
    setBlocProductsLoading(true);

    try {
      const products = await getBlocProducts(accessToken, bloc.id);
      setBlocProducts(products);
    } catch (err) {
      setBlocProductsError(err instanceof Error ? err.message : 'Failed to load bloc products');
    } finally {
      setBlocProductsLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-transparent">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">Warehouse details</p>
          <h2 className="text-lg font-semibold tracking-tight">
            {warehouse ? warehouse.name : `WAREHOUSE #${warehouseId}`}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{blocCount} blocs</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/warehouses"
            className="rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
          >
            Back
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-md bg-[var(--tint-success)] px-4 py-2 text-xs font-medium text-[var(--color-success)]"
          >
            Add new bloc
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading blocs...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                <th className="px-3 py-3">ID</th>
                <th className="px-3 py-3">NAME</th>
                <th className="px-3 py-3">CAPACITY</th>
                <th className="px-3 py-3">CURRENT USAGE</th>
                <th className="px-3 py-3">WAREHOUSE ID</th>
                <th className="px-3 py-3">UPDATED AT</th>
                <th className="px-3 py-3">VIEW PRODUCTS</th>
                <th className="px-3 py-3">UPDATE</th>
                <th className="px-3 py-3">DELETE</th>
              </tr>
            </thead>
            <tbody>
              {visibleBlocs.map((bloc) => {
                const isDeleting = deletingBlocId === bloc.id;

                return (
                  <tr key={bloc.id}>
                    <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{bloc.id}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{bloc.name}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{bloc.capacity}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{bloc.currentUsage}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{bloc.warehouseId}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{formatDate(bloc.updatedAt)}</td>
                    <td className="bg-[var(--card)] px-3 py-3">
                      <button
                        type="button"
                        onClick={() => void handleViewProducts(bloc)}
                        className="rounded-md bg-[var(--tint-warning)] px-3 py-1.5 text-xs font-medium text-[var(--color-warning)]"
                      >
                        View products
                      </button>
                    </td>
                    <td className="bg-[var(--card)] px-3 py-3">
                      <button
                        type="button"
                        onClick={() => openUpdateModal(bloc)}
                        className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)]"
                      >
                        Update
                      </button>
                    </td>
                    <td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBlocId(bloc.id)}
                        disabled={isDeleting}
                        className="rounded-md bg-[var(--tint-error)] px-3 py-1.5 text-xs font-medium text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {visibleBlocs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    {query.trim() ? 'No blocs match your search' : 'No blocs found in this warehouse'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--popover-foreground)]/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <p className="mb-2 text-[11px] tracking-[0.22em] text-[var(--muted-foreground)]">{editingBloc ? 'UPDATE BLOC' : 'ADD BLOC'}</p>
            <h3 className="mb-6 text-xl font-bold tracking-[0.04em] text-[var(--foreground)]">
              {editingBloc ? `Edit ${editingBloc.name}` : 'Create a new bloc'}
            </h3>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.16em] text-[var(--muted-foreground)]">NAME</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--role-admin)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.16em] text-[var(--muted-foreground)]">CAPACITY</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.capacity}
                  onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
                  required
                  className="border border-[var(--border)] bg-[var(--secondary)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--role-admin)]"
                />
              </div>

              <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="border border-[var(--border)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingBloc}
                  className="border border-[var(--color-success)] bg-[var(--tint-success)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--color-success)] transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingBloc ? 'SAVING...' : editingBloc ? 'SAVE CHANGES' : 'CREATE BLOC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteBloc && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--popover-foreground)]/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <p className="mb-2 text-[11px] tracking-[0.22em] text-[var(--muted-foreground)]">DELETE BLOC</p>
            <h3 className="mb-3 text-xl font-bold tracking-[0.04em] text-[var(--foreground)]">Are you sure you want to delete this bloc?</h3>
            <p className="mb-6 text-[13px] tracking-[0.04em] text-[var(--muted-foreground)]">{confirmDeleteBloc.name}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteBlocId(null)}
                className="border border-[var(--border)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteBloc(confirmDeleteBloc.id)}
                disabled={deletingBlocId === confirmDeleteBloc.id}
                className="border border-[var(--color-error)] bg-[var(--tint-error)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--color-error)] transition-colors hover:border-[var(--color-error)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingBlocId === confirmDeleteBloc.id ? 'DELETING...' : 'DELETE BLOC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {productsModalBloc && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[var(--popover-foreground)]/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-medium text-[var(--muted-foreground)]">Bloc products</p>
                <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{productsModalBloc.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setProductsModalBloc(null)}
                className="rounded-md border border-[var(--input)] bg-white px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>

            {blocProductsError && (
              <div className="mb-4 rounded-md bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
                {blocProductsError}
              </div>
            )}

              {blocProductsLoading ? (
              <div className="py-8 text-center text-sm text-[var(--muted-foreground)]">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                      <th className="px-3 py-3">ID</th>
                      <th className="px-3 py-3">NAME</th>
                      <th className="px-3 py-3">DESCRIPTION</th>
                      <th className="px-3 py-3">PRICE</th>
                      <th className="px-3 py-3">QUANTITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocProducts.filter((product) => {
                      const normalizedQuery = query.trim().toLowerCase();
                      if (!normalizedQuery) return true;
                      return [String(product.id), product.name, product.description ?? '', String(product.price), String(product.quantity)].some((value) =>
                        value.toLowerCase().includes(normalizedQuery),
                      );
                    }).map((product) => (
                      <tr key={product.id}>
                        <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{product.id}</td>
                        <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{product.name}</td>
                        <td className="max-w-[260px] bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{product.description ?? '-'}</td>
                        <td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{product.price}</td>
                        <td className="rounded-r-lg bg-[var(--card)] px-3 py-3 text-[12px] text-[var(--foreground)]">{product.quantity}</td>
                      </tr>
                    ))}

                    {blocProducts.filter((product) => {
                      const normalizedQuery = query.trim().toLowerCase();
                      if (!normalizedQuery) return true;
                      return [String(product.id), product.name, product.description ?? '', String(product.price), String(product.quantity)].some((value) =>
                        value.toLowerCase().includes(normalizedQuery),
                      );
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
                          {query.trim() ? 'No products match your search' : 'No products found in this bloc'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}