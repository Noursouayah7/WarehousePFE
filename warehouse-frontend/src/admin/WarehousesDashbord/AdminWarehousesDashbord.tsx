'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
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
		<section className="mt-14 rounded border border-[#1a1a1a] bg-[#101010] p-6">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold tracking-[0.08em]">WAREHOUSES DASHBOARD</h2>
					<p className="mt-1 text-[12px] tracking-[0.1em] text-[#666]">{warehouseCount} warehouses</p>
				</div>

				<button
					type="button"
					onClick={openCreateModal}
					className="border border-[#2f4f2f] bg-[#102010] px-4 py-2 text-[11px] tracking-[0.14em] text-[#8fe38f] transition-colors hover:border-[#3b6a3b] hover:text-[#caffca]"
				>
					ADD NEW WAREHOUSE
				</button>
			</div>

			{error && (
				<div className="mb-4 border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-[12px] tracking-[0.06em] text-[#ff8a8a]">
					{error}
				</div>
			)}

			{isLoading ? (
				<div className="py-10 text-center text-[12px] tracking-[0.12em] text-[#777]">LOADING WAREHOUSES...</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border-collapse">
						<thead>
							<tr className="border-b border-[#222] text-left text-[11px] tracking-[0.18em] text-[#7a7a7a]">
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
							{warehouses.map((warehouse) => {
								const isDeleting = deletingWarehouseId === warehouse.id;

								return (
									<tr key={warehouse.id} className="border-b border-[#1c1c1c]">
										<td className="px-3 py-3 text-[12px] text-[#ddd]">{warehouse.id}</td>
										<td className="px-3 py-3 text-[12px] text-[#d7d7d7]">
											<Link
												href={`/admin/warehouses/${warehouse.id}`}
												className="border-b border-transparent text-[#9ed2ff] transition-colors hover:border-[#9ed2ff] hover:text-[#d2ecff]"
											>
												{warehouse.name}
											</Link>
										</td>
										<td className="max-w-[260px] px-3 py-3 text-[12px] text-[#d7d7d7]">{warehouse.description ?? '-'}</td>
										<td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{warehouse.surface}</td>
										<td className="px-3 py-3 text-[12px] text-[#d7d7d7]">{warehouse.blocks.length}</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => openUpdateModal(warehouse)}
												className="border border-[#24405a] bg-[#0f1720] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#8ecfff] transition-colors hover:border-[#345d82] hover:text-[#d2ecff]"
											>
												UPDATE
											</button>
										</td>
										<td className="px-3 py-3">
											<button
												type="button"
												onClick={() => setConfirmDeleteWarehouseId(warehouse.id)}
												disabled={isDeleting}
												className="border border-[#5a1f1f] bg-[#2a0f0f] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[#ff9f9f] transition-colors hover:border-[#7a2f2f] hover:text-[#ffd0d0] disabled:cursor-not-allowed disabled:opacity-40"
											>
												{isDeleting ? 'DELETING...' : 'DELETE'}
											</button>
										</td>
									</tr>
								);
							})}

							{warehouses.length === 0 && (
								<tr>
									<td colSpan={7} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[#666]">
										NO WAREHOUSES FOUND
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}

			{isFormOpen && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
					<div className="w-full max-w-2xl border border-[#2b2b2b] bg-[#0f0f0f] p-6 shadow-2xl">
						<p className="mb-2 text-[11px] tracking-[0.22em] text-[#7a7a7a]">
							{editingWarehouse ? 'UPDATE WAREHOUSE' : 'ADD WAREHOUSE'}
						</p>
						<h3 className="mb-6 text-xl font-bold tracking-[0.04em] text-white">
							{editingWarehouse ? `Edit ${editingWarehouse.name}` : 'Create a new warehouse'}
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
								<label className="text-[11px] tracking-[0.16em] text-[#777]">SURFACE</label>
								<input
									type="number"
									min="0.01"
									step="0.01"
									value={form.surface}
									onChange={(event) => setForm((current) => ({ ...current, surface: event.target.value }))}
									required
									className="border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white outline-none focus:border-[#f0c040]"
								/>
							</div>

							<div className="flex flex-col gap-2 md:col-span-2">
								<label className="text-[11px] tracking-[0.16em] text-[#777]">DESCRIPTION</label>
								<textarea
									value={form.description}
									onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
									rows={3}
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
									disabled={savingWarehouse}
									className="border border-[#2f4f2f] bg-[#102010] px-4 py-2 text-[11px] tracking-[0.14em] text-[#8fe38f] transition-colors hover:border-[#3b6a3b] hover:text-[#caffca] disabled:cursor-not-allowed disabled:opacity-40"
								>
									{savingWarehouse ? 'SAVING...' : editingWarehouse ? 'SAVE CHANGES' : 'CREATE WAREHOUSE'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{confirmDeleteWarehouse && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
					<div className="w-full max-w-md border border-[#2b2b2b] bg-[#0f0f0f] p-6 shadow-2xl">
						<p className="mb-2 text-[11px] tracking-[0.22em] text-[#7a7a7a]">DELETE WAREHOUSE</p>
						<h3 className="mb-3 text-xl font-bold tracking-[0.04em] text-white">
							Are you sure you want to delete this warehouse?
						</h3>
						<p className="mb-6 text-[13px] tracking-[0.04em] text-[#9a9a9a]">
							{confirmDeleteWarehouse.name}
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmDeleteWarehouseId(null)}
								className="border border-[#2b2b2b] px-4 py-2 text-[11px] tracking-[0.14em] text-[#b5b5b5] transition-colors hover:border-[#3a3a3a] hover:text-white"
							>
								CANCEL
							</button>
							<button
								type="button"
								onClick={() => void handleDeleteWarehouse(confirmDeleteWarehouse.id)}
								disabled={deletingWarehouseId === confirmDeleteWarehouse.id}
								className="border border-[#5a1f1f] bg-[#2a0f0f] px-4 py-2 text-[11px] tracking-[0.14em] text-[#ff9f9f] transition-colors hover:border-[#7a2f2f] hover:text-[#ffd0d0] disabled:cursor-not-allowed disabled:opacity-40"
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
