'use client';

type ActiveSection = 'products' | 'orders' | null;

interface CustomerPanelProps {
	productsCount: number;
	ordersCount: number;
	pendingOrdersCount: number;
	activeSection: ActiveSection;
	onToggleProducts: () => void;
	onToggleOrders: () => void;
	onClearSection: () => void;
	onLogout: () => void;
}

export function CustomerPanel({
	productsCount,
	ordersCount,
	pendingOrdersCount,
	activeSection,
	onToggleProducts,
	onToggleOrders,
	onClearSection,
	onLogout,
}: CustomerPanelProps) {
	return (
		<>
			<div className="flex items-center justify-between border-b border-[#a3b18a] px-6 py-4 md:px-10">
				<div className="flex items-center gap-3">
					<div
						className="h-6 w-6 bg-[var(--role-customer)]"
						style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
					/>
					<span className="text-sm font-medium tracking-[0.04em]">Cerebro WMS</span>
				</div>
				<div className="flex items-center gap-6">
					<span className="rounded-full bg-[var(--role-customer)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-black">
						Customer
					</span>
					<button
						onClick={onLogout}
						className="cursor-pointer rounded-lg border border-[#d6d3cc] bg-transparent px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
					>
						Logout
					</button>
				</div>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-14">
				<p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">Dashboard</p>
				<h1 className="mb-2 text-4xl font-semibold tracking-tight">Customer panel</h1>
				<p className="text-sm text-[var(--muted-foreground)]">
					Choose a product, submit an order request, and track its status
				</p>

				<div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					<button
						type="button"
						onClick={onToggleProducts}
						className={`text-left rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
							activeSection === 'products'
								? 'border-[var(--color-info)] bg-[#edf2ee]'
								: 'border-[#a3b18a] bg-[#f5f1e8] hover:border-[var(--color-info)] hover:bg-[#edf2ee]'
						}`}
					>
						<div className="mb-4 h-6 w-[3px] bg-[var(--role-customer)]" />
						<p className="mb-2 text-base font-semibold text-[var(--role-customer)]">Available products</p>
						<p className="text-[28px] font-bold">{productsCount}</p>
					</button>

					<button
						type="button"
						onClick={onToggleOrders}
						className={`text-left rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
							activeSection === 'orders'
								? 'border-[var(--color-warning)] bg-[#f6eddc]'
								: 'border-[#a3b18a] bg-[#f5f1e8] hover:border-[var(--color-warning)] hover:bg-[#f6eddc]'
						}`}
					>
						<div className="mb-4 h-6 w-[3px] bg-[var(--role-admin)]" />
						<p className="mb-2 text-base font-semibold text-[var(--role-admin)]">My orders</p>
						<p className="text-[28px] font-bold">{ordersCount}</p>
					</button>

					<button
						type="button"
						onClick={onToggleOrders}
						className={`text-left rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
							activeSection === 'orders'
								? 'border-[var(--color-error)] bg-[#f8efe9]'
								: 'border-[#a3b18a] bg-[#f5f1e8] hover:border-[var(--color-error)] hover:bg-[#f8efe9]'
						}`}
					>
						<div className="mb-4 h-6 w-[3px] bg-[var(--tint-error)]" />
						<p className="mb-2 text-base font-semibold text-[var(--color-error)]">Pending review</p>
						<p className="text-[28px] font-bold">{pendingOrdersCount}</p>
					</button>
				</div>

				{activeSection && (
					<div className="mt-6 flex justify-end">
						<button
							onClick={onClearSection}
							className="rounded-lg border border-[#d6d3cc] bg-transparent px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
						>
							View all
						</button>
					</div>
				)}
			</div>
		</>
	);
}
