'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import {
	AdminDashboardWarehouse,
	createAdminWarehouse,
	deleteAdminWarehouse,
	getAdminWarehouses,
	updateAdminWarehouse,
	WarehousePayload,
} from './WarehouseDashbord.admin.api';

type WarehouseFormState = {
	name: string;
	description: string;
	surface: string;
};

const emptyForm: WarehouseFormState = {
	name: '',
	description: '',
	surface: '',
};

function toFormState(warehouse: AdminDashboardWarehouse): WarehouseFormState {
	return {
		name: warehouse.name,
		description: warehouse.description ?? '',
		surface: String(warehouse.surface),
	};
}

function toPayload(form: WarehouseFormState): WarehousePayload {
	return {
		name: form.name.trim(),
		description: form.description.trim() || undefined,
		surface: Number(form.surface),
	};
}

export default function AdminWarehousesDashbord() {
	const { token } = useAuth();
	const { query } = useWorkspaceSearch();
	const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingWarehouseId, setEditingWarehouseId] = useState<number | null>(null);
	const [confirmDeleteWarehouseId, setConfirmDeleteWarehouseId] = useState<number | null>(null);
	const [savingWarehouse, setSavingWarehouse] = useState(false);
	const [deletingWarehouseId, setDeletingWarehouseId] = useState<number | null>(null);
	const [form, setForm] = useState<WarehouseFormState>(emptyForm);

	useEffect(() => {
		const accessToken = token;

		if (!accessToken) {
			setIsLoading(false);
			setError('Missing auth token. Please login again.');
			return;
		}

		const activeToken: string = accessToken;
		let isMounted = true;

		async function loadWarehouses() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getAdminWarehouses(activeToken);
				if (isMounted) {
					setWarehouses(data);
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Failed to load warehouses');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadWarehouses();

		return () => {
			isMounted = false;
		};
	}, [token]);

	const warehouseCount = useMemo(() => warehouses.length, [warehouses]);
	const visibleWarehouses = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return warehouses;
		return warehouses.filter((warehouse) => {
			return [
				String(warehouse.id),
				warehouse.name,
				warehouse.description ?? '',
				String(warehouse.surface),
				String(warehouse.blocks.length),
			].some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}, [warehouses, query]);
	const confirmDeleteWarehouse = warehouses.find((warehouse) => warehouse.id === confirmDeleteWarehouseId) ?? null;
	const editingWarehouse = warehouses.find((warehouse) => warehouse.id === editingWarehouseId) ?? null;

	function openCreateModal() {
		setEditingWarehouseId(null);
		setForm(emptyForm);
		setIsFormOpen(true);
	}

	function openUpdateModal(warehouse: AdminDashboardWarehouse) {
		setEditingWarehouseId(warehouse.id);
		setForm(toFormState(warehouse));
		setIsFormOpen(true);
	}

	function closeFormModal() {
		if (savingWarehouse) {
			return;
		}
		setIsFormOpen(false);
		setEditingWarehouseId(null);
		setForm(emptyForm);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const accessToken = token;
		if (!accessToken) {
			setError('Missing auth token. Please login again.');
			return;
		}

		const payload = toPayload(form);
		if (!payload.name || Number.isNaN(payload.surface) || payload.surface <= 0) {
			setError('Please provide a valid name and a surface greater than 0.');
			return;
		}

		setSavingWarehouse(true);
		setError(null);

		try {
			const result = editingWarehouseId
				? await updateAdminWarehouse(accessToken, editingWarehouseId, payload)
				: await createAdminWarehouse(accessToken, payload);

			if (editingWarehouseId) {
				setWarehouses((current) =>
					current.map((warehouse) => (warehouse.id === editingWarehouseId ? result : warehouse)),
				);
			} else {
				setWarehouses((current) => [result, ...current]);
			}

			setIsFormOpen(false);
			setEditingWarehouseId(null);
			setForm(emptyForm);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save warehouse');
		} finally {
			setSavingWarehouse(false);
		}
	}

	async function handleDeleteWarehouse(warehouseId: number) {
		const accessToken = token;
		if (!accessToken) {
			setError('Missing auth token. Please login again.');
			return;
		}

		setDeletingWarehouseId(warehouseId);
		setError(null);

		try {
			await deleteAdminWarehouse(accessToken, warehouseId);
			setWarehouses((current) => current.filter((warehouse) => warehouse.id !== warehouseId));
			setConfirmDeleteWarehouseId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete warehouse');
		} finally {
			setDeletingWarehouseId(null);
		}
	}

	return (
		<section className="mt-8 rounded-2xl bg-transparent">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Warehouses</h2>
					<p className="mt-1 text-sm text-[var(--muted-foreground)]">{warehouseCount} warehouses</p>
				</div>

				<button
					type="button"
					onClick={openCreateModal}
					className="rounded-md bg-[var(--tint-success)] px-4 py-2 text-xs font-medium text-[var(--color-success)]"
				>
					Add new warehouse
				</button>
			</div>

			{error && (
				<div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
					<span aria-hidden="true">!</span>
					{error}
				</div>
			)}

			{isLoading ? (
				<div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading warehouses...</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-2">
						<thead>
							<tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
								<th className="px-3 py-3">ID</th>
								<th className="px-3 py-3">NAME</th>
								<th className="px-3 py-3">DESCRIPTION</th>
								<th className="px-3 py-3">SURFACE</th>
								<th className="px-3 py-3">BLOC NUMBER</th>
								<th className="px-3 py-3">UPDATE</th>
								<th className="px-3 py-3">DELETE</th>
							</tr>
						</thead>
						<tbody>
							{visibleWarehouses.map((warehouse) => {
								const isDeleting = deletingWarehouseId === warehouse.id;

								return (
									<tr key={warehouse.id}>
										<td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{warehouse.id}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">
											<Link
												href={`/admin/warehouses/${warehouse.id}`}
												className="border-b border-transparent text-[var(--color-info)] transition-colors hover:border-[var(--color-info)] hover:text-[var(--color-info)]"
											>
												{warehouse.name}
											</Link>
										</td>
										<td className="max-w-[260px] bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{warehouse.description ?? '-'}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{warehouse.surface}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{warehouse.blocks.length}</td>
										<td className="bg-[var(--card)] px-3 py-3">
											<button
												type="button"
												onClick={() => openUpdateModal(warehouse)}
												className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)]"
											>
												Update
											</button>
										</td>
										<td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
											<button
												type="button"
												onClick={() => setConfirmDeleteWarehouseId(warehouse.id)}
												disabled={isDeleting}
												className="rounded-md bg-[var(--tint-error)] px-3 py-1.5 text-xs font-medium text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40"
											>
												{isDeleting ? 'Deleting...' : 'Delete'}
											</button>
										</td>
									</tr>
								);
							})}

							{visibleWarehouses.length === 0 && (
								<tr>
									<td colSpan={7} className="px-3 py-8 text-center text-sm text-[#6b705c]">
										{query.trim() ? 'No warehouses match your search' : 'No warehouses found'}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{isFormOpen && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-[#37352f]/30 px-4 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
						<p className="mb-2 text-[11px] tracking-[0.22em] text-[#6b705c]">
							{editingWarehouse ? 'UPDATE WAREHOUSE' : 'ADD WAREHOUSE'}
						</p>
						<h3 className="mb-6 text-xl font-bold tracking-[0.04em] text-[#344e41]">
							{editingWarehouse ? `Edit ${editingWarehouse.name}` : 'Create a new warehouse'}
						</h3>

						<form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">NAME</label>
								<input
									value={form.name}
									onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
									required
									className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">SURFACE</label>
								<input
									type="number"
									min="0.01"
									step="0.01"
									value={form.surface}
									onChange={(event) => setForm((current) => ({ ...current, surface: event.target.value }))}
									required
									className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
								/>
							</div>

							<div className="flex flex-col gap-2 md:col-span-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">DESCRIPTION</label>
								<textarea
									value={form.description}
									onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
									rows={3}
									className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
								/>
							</div>

							<div className="mt-2 flex justify-end gap-3 md:col-span-2">
								<button
									type="button"
									onClick={closeFormModal}
									className="border border-[#b7c2a0] px-4 py-2 text-[11px] tracking-[0.14em] text-[#5f6f59] transition-colors hover:border-[#8fa07a] hover:text-[#344e41]"
								>
									CANCEL
								</button>
								<button
									type="submit"
									disabled={savingWarehouse}
									className="border border-[var(--color-success)] bg-[var(--tint-success)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--color-success)] transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)] disabled:cursor-not-allowed disabled:opacity-40"
								>
									{savingWarehouse ? 'SAVING...' : editingWarehouse ? 'SAVE CHANGES' : 'CREATE WAREHOUSE'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{confirmDeleteWarehouse && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-[#37352f]/30 px-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
						<p className="mb-2 text-[11px] tracking-[0.22em] text-[#6b705c]">DELETE WAREHOUSE</p>
						<h3 className="mb-3 text-xl font-bold tracking-[0.04em] text-[#344e41]">
							Are you sure you want to delete this warehouse?
						</h3>
						<p className="mb-6 text-[13px] tracking-[0.04em] text-[#6b705c]">
							{confirmDeleteWarehouse.name}
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmDeleteWarehouseId(null)}
								className="border border-[#b7c2a0] px-4 py-2 text-[11px] tracking-[0.14em] text-[#5f6f59] transition-colors hover:border-[#8fa07a] hover:text-[#344e41]"
							>
								CANCEL
							</button>
							<button
								type="button"
								onClick={() => void handleDeleteWarehouse(confirmDeleteWarehouse.id)}
								disabled={deletingWarehouseId === confirmDeleteWarehouse.id}
								className="border border-[var(--color-error)] bg-[var(--tint-error)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--color-error)] transition-colors hover:border-[var(--color-error)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40"
							>
								{deletingWarehouseId === confirmDeleteWarehouse.id ? 'DELETING...' : 'DELETE WAREHOUSE'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
