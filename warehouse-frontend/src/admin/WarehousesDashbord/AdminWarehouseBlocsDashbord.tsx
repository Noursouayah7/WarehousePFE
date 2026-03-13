'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
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
    <section className="mt-14 rounded border border-[#1a1a1a] bg-[#101010] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-2 text-[11px] tracking-[0.2em] text-[#666]">WAREHOUSE DETAILS</p>
          <h2 className="text-xl font-bold tracking-[0.08em]">
            {warehouse ? warehouse.name : `WAREHOUSE #${warehouseId}`}
          </h2>
          <p className="mt-1 text-[12px] tracking-[0.1em] text-[#666]">{blocCount} blocs</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/warehouses"
            className="border border-[#2b2b2b] px-4 py-2 text-[11px] tracking-[0.14em] text-[#b5b5b5] transition-colors hover:border-[#3a3a3a] hover:text-white"
          >
            BACK
          </Link>
          <button
            type="button"
            onClick={openCreateModal}
            className="border border-[#2f4f2f] bg-[#102010] px-4 py-2 text-[11px] tracking-[0.14em] text-[#8fe38f] transition-colors hover:border-[#3b6a3b] hover:text-[#caffca]"
          >
            ADD NEW BLOC
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-[12px] tracking-[0.06em] text-[#ff8a8a]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-[12px] tracking-[0.12em] text-[#777]">LOADING BLOCS...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-[#222] text-left text-[11px] tracking-[0.18em] text-[#7a7a7a]">
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
              {blocs.map((bloc) => {
                const isDeleting = deletingBlocId === bloc.id;

                return (
                  <tr key={bloc.id} className="border-b border-[#1c1c1c]">
                    <td className="px-3 py-3 text-[12px] text-[#ddd]">{bloc.id}</td>
                    <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{bloc.name}</td>
                    <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{bloc.capacity}</td>
                    <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{bloc.currentUsage}</td>
                    <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{bloc.warehouseId}</td>
                    <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{formatDate(bloc.updatedAt)}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => void handleViewProducts(bloc)}
                        className="border border-[#4b3f21] bg-[#21190f] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#f0c978] transition-colors hover:border-[#6a5933] hover:text-[#ffe2a9]"
                      >
                        VIEW PRODUCTS
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => openUpdateModal(bloc)}
                        className="border border-[#24405a] bg-[#0f1720] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#8ecfff] transition-colors hover:border-[#345d82] hover:text-[#d2ecff]"
                      >
                        UPDATE
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteBlocId(bloc.id)}
                        disabled={isDeleting}
                        className="border border-[#5a1f1f] bg-[#2a0f0f] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#ff9f9f] transition-colors hover:border-[#7a2f2f] hover:text-[#ffd0d0] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isDeleting ? 'DELETING...' : 'DELETE'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {blocs.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[#666]">
                    NO BLOCS FOUND IN THIS WAREHOUSE
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-xl border border-[#2b2b2b] bg-[#0f0f0f] p-6 shadow-2xl">
            <p className="mb-2 text-[11px] tracking-[0.22em] text-[#7a7a7a]">{editingBloc ? 'UPDATE BLOC' : 'ADD BLOC'}</p>
            <h3 className="mb-6 text-xl font-bold tracking-[0.04em] text-white">
              {editingBloc ? `Edit ${editingBloc.name}` : 'Create a new bloc'}
            </h3>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.16em] text-[#777]">NAME</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#f0c040]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.16em] text-[#777]">CAPACITY</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.capacity}
                  onChange={(event) => setForm((current) => ({ ...current, capacity: event.target.value }))}
                  required
                  className="border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#f0c040]"
                />
              </div>

              <div className="mt-2 flex justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="border border-[#2b2b2b] px-4 py-2 text-[11px] tracking-[0.14em] text-[#b5b5b5] transition-colors hover:border-[#3a3a3a] hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={savingBloc}
                  className="border border-[#2f4f2f] bg-[#102010] px-4 py-2 text-[11px] tracking-[0.14em] text-[#8fe38f] transition-colors hover:border-[#3b6a3b] hover:text-[#caffca] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingBloc ? 'SAVING...' : editingBloc ? 'SAVE CHANGES' : 'CREATE BLOC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteBloc && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md border border-[#2b2b2b] bg-[#0f0f0f] p-6 shadow-2xl">
            <p className="mb-2 text-[11px] tracking-[0.22em] text-[#7a7a7a]">DELETE BLOC</p>
            <h3 className="mb-3 text-xl font-bold tracking-[0.04em] text-white">Are you sure you want to delete this bloc?</h3>
            <p className="mb-6 text-[13px] tracking-[0.04em] text-[#9a9a9a]">{confirmDeleteBloc.name}</p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteBlocId(null)}
                className="border border-[#2b2b2b] px-4 py-2 text-[11px] tracking-[0.14em] text-[#b5b5b5] transition-colors hover:border-[#3a3a3a] hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteBloc(confirmDeleteBloc.id)}
                disabled={deletingBlocId === confirmDeleteBloc.id}
                className="border border-[#5a1f1f] bg-[#2a0f0f] px-4 py-2 text-[11px] tracking-[0.14em] text-[#ff9f9f] transition-colors hover:border-[#7a2f2f] hover:text-[#ffd0d0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingBlocId === confirmDeleteBloc.id ? 'DELETING...' : 'DELETE BLOC'}
              </button>
            </div>
          </div>
        </div>
      )}

      {productsModalBloc && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-5xl border border-[#2b2b2b] bg-[#0f0f0f] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-[11px] tracking-[0.22em] text-[#7a7a7a]">BLOC PRODUCTS</p>
                <h3 className="text-xl font-bold tracking-[0.04em] text-white">{productsModalBloc.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setProductsModalBloc(null)}
                className="border border-[#2b2b2b] px-4 py-2 text-[11px] tracking-[0.14em] text-[#b5b5b5] transition-colors hover:border-[#3a3a3a] hover:text-white"
              >
                CLOSE
              </button>
            </div>

            {blocProductsError && (
              <div className="mb-4 border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-[12px] tracking-[0.06em] text-[#ff8a8a]">
                {blocProductsError}
              </div>
            )}

            {blocProductsLoading ? (
              <div className="py-8 text-center text-[12px] tracking-[0.12em] text-[#777]">LOADING PRODUCTS...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#222] text-left text-[11px] tracking-[0.18em] text-[#7a7a7a]">
                      <th className="px-3 py-3">ID</th>
                      <th className="px-3 py-3">NAME</th>
                      <th className="px-3 py-3">DESCRIPTION</th>
                      <th className="px-3 py-3">PRICE</th>
                      <th className="px-3 py-3">QUANTITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocProducts.map((product) => (
                      <tr key={product.id} className="border-b border-[#1c1c1c]">
                        <td className="px-3 py-3 text-[12px] text-[#ddd]">{product.id}</td>
                        <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{product.name}</td>
                        <td className="max-w-[260px] px-3 py-3 text-[12px] text-[#d7d7d7]">{product.description ?? '-'}</td>
                        <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{product.price}</td>
                        <td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{product.quantity}</td>
                      </tr>
                    ))}

                    {blocProducts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[#666]">
                          NO PRODUCTS FOUND IN THIS BLOC
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