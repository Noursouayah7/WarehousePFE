'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import {
	AdminDashboardProduct,
	createAdminProduct,
	deleteAdminProduct,
	getAdminProducts,
	ProductPayload,
	updateAdminProduct,
} from './ProductDashbord.admin.api';
import {
	AdminDashboardWarehouse,
	getAdminWarehouses,
} from '../WarehousesDashbord/WarehouseDashbord.admin.api';

type ProductFormState = {
	name: string;
	description: string;
	blocId: string;
	price: string;
	quantity: string;
};

const emptyForm: ProductFormState = {
	name: '',
	description: '',
	blocId: '',
	price: '',
	quantity: '0',
};

function toFormState(product: AdminDashboardProduct): ProductFormState {
	return {
		name: product.name,
		description: product.description ?? '',
		blocId: String(product.blocId),
		price: String(product.price),
		quantity: String(product.quantity),
	};
}

function toPayload(form: ProductFormState): ProductPayload {
	return {
		name: form.name.trim(),
		description: form.description.trim() || undefined,
		blocId: Number(form.blocId),
		price: Number(form.price),
		quantity: Number(form.quantity),
	};
}

export default function AdminProductsDashbord() {
	const { token } = useAuth();
	const [products, setProducts] = useState<AdminDashboardProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingProductId, setEditingProductId] = useState<number | null>(null);
	const [confirmDeleteProductId, setConfirmDeleteProductId] = useState<number | null>(null);
	const [savingProduct, setSavingProduct] = useState(false);
	const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
	const [form, setForm] = useState<ProductFormState>(emptyForm);
	const [formError, setFormError] = useState<string | null>(null);
	const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
	const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

	useEffect(() => {
		const accessToken = token;

		if (!accessToken) {
			setIsLoading(false);
			setError('Missing auth token. Please login again.');
			return;
		}

		const activeToken: string = accessToken;
		let isMounted = true;

		async function loadProducts() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getAdminProducts(activeToken);
				if (isMounted) {
					setProducts(data);
				}
			} catch (err) {
				if (isMounted) {
					setError(err instanceof Error ? err.message : 'Failed to load products');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		}

		void loadProducts();

		return () => {
			isMounted = false;
		};
	}, [token]);

	useEffect(() => {
		if (!token) return;
		const activeToken = token;
		let isMounted = true;
		async function loadWarehouses() {
			try {
				const data = await getAdminWarehouses(activeToken);
				if (isMounted) setWarehouses(data);
			} catch {
				// non-critical
			}
		}
		void loadWarehouses();
		return () => { isMounted = false; };
	}, [token]);

	const productCount = useMemo(() => products.length, [products]);
	const confirmDeleteProduct = products.find((product) => product.id === confirmDeleteProductId) ?? null;
	const editingProduct = products.find((product) => product.id === editingProductId) ?? null;

	function openCreateModal() {
		setEditingProductId(null);
		setForm(emptyForm);
		setFormError(null);
		setSelectedWarehouseId('');
		setIsFormOpen(true);
	}

	function openUpdateModal(product: AdminDashboardProduct) {
		setEditingProductId(product.id);
		setForm(toFormState(product));
		setFormError(null);
		const owningWarehouse = warehouses.find((w) => w.blocks.some((b) => b.id === product.blocId));
		setSelectedWarehouseId(owningWarehouse ? String(owningWarehouse.id) : '');
		setIsFormOpen(true);
	}

	function closeFormModal() {
		if (savingProduct) {
			return;
		}
		setIsFormOpen(false);
		setEditingProductId(null);
		setForm(emptyForm);
		setFormError(null);
		setSelectedWarehouseId('');
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const accessToken = token;
		if (!accessToken) {
			setError('Missing auth token. Please login again.');
			return;
		}

		setSavingProduct(true);
		setError(null);
		setFormError(null);

		try {
			const payload = toPayload(form);
			const result = editingProductId
				? await updateAdminProduct(accessToken, editingProductId, payload)
				: await createAdminProduct(accessToken, payload);

			if (editingProductId) {
				setProducts((current) => current.map((product) => (product.id === editingProductId ? result : product)));
			} else {
				setProducts((current) => [result, ...current]);
			}

			setIsFormOpen(false);
			setEditingProductId(null);
			setForm(emptyForm);
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to save product';
			if (message.toLowerCase().includes('already exists')) {
				setFormError('This product already exists.');
			} else if (message.toLowerCase().includes('capacity') || message.toLowerCase().includes('not enough')) {
				setFormError(message);
			} else {
				setError(message);
			}
		} finally {
			setSavingProduct(false);
		}
	}

	async function handleDeleteProduct(productId: number) {
		const accessToken = token;
		if (!accessToken) {
			setError('Missing auth token. Please login again.');
			return;
		}

		setDeletingProductId(productId);
		setError(null);

		try {
			await deleteAdminProduct(accessToken, productId);
			setProducts((current) => current.filter((product) => product.id !== productId));
			setConfirmDeleteProductId(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to delete product');
		} finally {
			setDeletingProductId(null);
		}
	}

	return (
		<section className="mt-8 rounded-2xl bg-transparent">
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-lg font-semibold tracking-tight">Products</h2>
					<p className="mt-1 text-sm text-[var(--muted-foreground)]">{productCount} products</p>
				</div>

				<button
					type="button"
					onClick={openCreateModal}
					className="rounded-md bg-[var(--tint-success)] px-4 py-2 text-xs font-medium text-[var(--color-success)] transition-colors"
				>
					Add new product
				</button>
			</div>

			{error && (
				<div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
					<span aria-hidden="true">!</span>
					{error}
				</div>
			)}

			{isLoading ? (
				<div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading products...</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-2">
						<thead>
							<tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
								<th className="px-3 py-3">ID</th>
								<th className="px-3 py-3">NAME</th>
								<th className="px-3 py-3">DESCRIPTION</th>
								<th className="px-3 py-3">BLOC ID</th>
								<th className="px-3 py-3">PRICE</th>
								<th className="px-3 py-3">QUANTITY</th>
								<th className="px-3 py-3">UPDATE</th>
								<th className="px-3 py-3">DELETE</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => {
								const isDeleting = deletingProductId === product.id;

								return (
									<tr key={product.id}>
										<td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{product.id}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{product.name}</td>
										<td className="max-w-[260px] bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{product.description ?? '-'}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{product.blocId}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{product.price}</td>
										<td className="bg-[var(--card)] px-3 py-3 text-[12px] text-[#496553]">{product.quantity}</td>
										<td className="bg-[var(--card)] px-3 py-3">
											<button
												type="button"
												onClick={() => openUpdateModal(product)}
												className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)]"
											>
												Update
											</button>
										</td>
										<td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
											<button
												type="button"
												onClick={() => setConfirmDeleteProductId(product.id)}
												disabled={isDeleting}
												className="rounded-md bg-[var(--tint-error)] px-3 py-1.5 text-xs font-medium text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40"
											>
												{isDeleting ? 'Deleting...' : 'Delete'}
											</button>
										</td>
									</tr>
								);
							})}

							{products.length === 0 && (
								<tr>
									<td colSpan={8} className="px-3 py-8 text-center text-sm text-[#6b705c]">
										No products found
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
							{editingProduct ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
						</p>
						<h3 className="mb-6 text-xl font-bold tracking-[0.04em] text-[#344e41]">
							{editingProduct ? `Edit ${editingProduct.name}` : 'Create a new product'}
						</h3>

						<form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
							<div className="flex flex-col gap-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">NAME</label>
							<input
								value={form.name}
								onChange={(event) => {
									setFormError(null);
									setForm((current) => ({ ...current, name: event.target.value }));
								}}
								required
							className={`border bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)] ${formError && formError.includes('already exists') ? 'border-[var(--color-error)]' : 'border-[#b7c2a0]'}`}
						/>
						{formError && formError.includes('already exists') && (
								<p className="text-[11px] tracking-[0.06em] text-[var(--color-error)]">{formError}</p>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">WAREHOUSE</label>
							<select
								value={selectedWarehouseId}
								onChange={(event) => {
									setSelectedWarehouseId(event.target.value);
									setForm((current) => ({ ...current, blocId: '' }));
								}}
								required
								className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
							>
								<option value="" disabled>Select a warehouse</option>
								{warehouses.map((w) => (
									<option key={w.id} value={String(w.id)}>{w.name}</option>
								))}
							</select>
						</div>

						{selectedWarehouseId && (
							<div className="flex flex-col gap-2 md:col-span-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">BLOC</label>
								<select
									value={form.blocId}
								onChange={(event) => {
									setFormError(null);
									setForm((current) => ({ ...current, blocId: event.target.value }));
								}}
								required
								className={`border bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)] ${formError && !formError.includes('already exists') ? 'border-[var(--color-error)]' : 'border-[#b7c2a0]'}`}
							>
								<option value="" disabled>Select a bloc</option>
								{warehouses
									.find((w) => String(w.id) === selectedWarehouseId)
									?.blocks.map((b) => (
										<option key={b.id} value={String(b.id)}>{b.name}</option>
									))}
							</select>
							{formError && !formError.includes('already exists') && (
								<p className="text-[11px] tracking-[0.06em] text-[var(--color-error)]">{formError}</p>
							)}
							</div>
						)}
							<div className="flex flex-col gap-2 md:col-span-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">DESCRIPTION</label>
								<textarea
									value={form.description}
									onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
									rows={3}
									className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">PRICE</label>
								<input
									type="number"
									min="0"
									step="0.01"
									value={form.price}
									onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
									required
									className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-[11px] tracking-[0.16em] text-[#6b705c]">QUANTITY</label>
								<input
									type="number"
									min="0"
									value={form.quantity}
									onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
									required
									className="border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--role-admin)]"
								/>
							</div>

							<div className="md:col-span-2 mt-2 flex justify-end gap-3">
								<button
									type="button"
									onClick={closeFormModal}
									className="border border-[#b7c2a0] px-4 py-2 text-[11px] tracking-[0.14em] text-[#5f6f59] transition-colors hover:border-[#8fa07a] hover:text-[#344e41]"
								>
									CANCEL
								</button>
								<button
									type="submit"
									disabled={savingProduct}
									className="border border-[var(--color-success)] bg-[var(--tint-success)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--color-success)] transition-colors hover:border-[var(--color-success)] hover:text-[var(--color-success)] disabled:cursor-not-allowed disabled:opacity-40"
								>
									{savingProduct ? 'SAVING...' : editingProduct ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{confirmDeleteProduct && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-[#37352f]/30 px-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-xl">
						<p className="mb-2 text-[11px] tracking-[0.22em] text-[#6b705c]">DELETE PRODUCT</p>
						<h3 className="mb-3 text-xl font-bold tracking-[0.04em] text-[#344e41]">
							Are you sure you want to delete this product?
						</h3>
						<p className="mb-6 text-[13px] tracking-[0.04em] text-[#6b705c]">
							{confirmDeleteProduct.name}
						</p>
						<div className="flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmDeleteProductId(null)}
								className="border border-[#b7c2a0] px-4 py-2 text-[11px] tracking-[0.14em] text-[#5f6f59] transition-colors hover:border-[#8fa07a] hover:text-[#344e41]"
							>
								CANCEL
							</button>
							<button
								type="button"
								onClick={() => void handleDeleteProduct(confirmDeleteProduct.id)}
								disabled={deletingProductId === confirmDeleteProduct.id}
								className="border border-[var(--color-error)] bg-[var(--tint-error)] px-4 py-2 text-[11px] tracking-[0.14em] text-[var(--color-error)] transition-colors hover:border-[var(--color-error)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-40"
							>
								{deletingProductId === confirmDeleteProduct.id ? 'DELETING...' : 'DELETE PRODUCT'}
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
