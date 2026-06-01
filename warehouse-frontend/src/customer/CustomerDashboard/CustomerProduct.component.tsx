'use client';

import { useMemo } from 'react';
import { CustomerProductOption } from '../customer.api';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';

interface CustomerProductProps {
	products: CustomerProductOption[];
	isLoading: boolean;
	onSelectProduct: (product: CustomerProductOption) => void;
}

export function CustomerProduct({ products, isLoading, onSelectProduct }: CustomerProductProps) {
	const { query } = useWorkspaceSearch();
	const visibleProducts = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return products;
		return products.filter((product) => {
			return [product.name, product.description ?? '', String(product.price)].some((value) =>
				value.toLowerCase().includes(normalizedQuery),
			);
		});
	}, [products, query]);

	return (
		<section id="products-section" className="mt-6 rounded-2xl bg-transparent">
			<h2 className="text-xl font-semibold tracking-tight">Products</h2>
			<p className="mt-1 text-sm text-[var(--muted-foreground)]">Click on a product to place an order</p>

			{isLoading ? (
				<div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading products...</div>
			) : (
				<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{visibleProducts.map((product) => (
						<button
							key={product.id}
							type="button"
							onClick={() => onSelectProduct(product)}
							className="text-left rounded-xl bg-[var(--card)] p-4 shadow-sm transition-colors hover:bg-[var(--secondary)]"
						>
							<p className="text-[16px] font-semibold text-[var(--color-info)]">{product.name}</p>
							{product.description && (
								<p className="mt-2 text-xs text-[var(--muted-foreground)]">{product.description}</p>
							)}
							<p className="mt-1 text-xs text-[var(--muted-foreground)]">Price: ${product.price.toFixed(2)}</p>
							<p className="mt-3 text-xs text-[var(--muted-foreground)]">Click to order</p>
						</button>
					))}

					{visibleProducts.length === 0 && (
						<div className="col-span-full rounded-lg bg-[var(--secondary)] p-8 text-center text-sm text-[var(--muted-foreground)]">
							{query.trim() ? 'No products match your search' : 'No products available right now'}
						</div>
					)}
				</div>
			)}
		</section>
	);
}
