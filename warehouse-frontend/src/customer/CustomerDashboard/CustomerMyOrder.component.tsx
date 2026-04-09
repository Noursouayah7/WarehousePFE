'use client';

import { useMemo } from 'react';
import { CustomerOrder, CustomerOrderStatus } from '../customer.api';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';

interface CustomerMyOrderProps {
	orders: CustomerOrder[];
	isLoading: boolean;
}

function formatDate(value: string | null): string {
	if (!value) return '—';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '—';
	return date.toLocaleString();
}

function statusClasses(status: CustomerOrderStatus): string {
	if (status === 'APPROVED' || status === 'COMPLETED') {
		return 'border-[var(--color-success)] bg-[#edf3ea] text-[var(--color-success)]';
	}

	if (status === 'REJECTED') {
		return 'border-[var(--color-error)] bg-[#f8efe9] text-[var(--color-error)]';
	}

	if (status === 'RESTOCK_REQUESTED') {
		return 'border-[var(--color-warning)] bg-[#f6eddc] text-[var(--color-warning)]';
	}

	return 'border-[var(--color-info)] bg-[#edf2ee] text-[var(--color-info)]';
}

export function CustomerMyOrder({ orders, isLoading }: CustomerMyOrderProps) {
	const { query } = useWorkspaceSearch();
	const visibleOrders = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) return orders;
		return orders.filter((order) => {
			return [
				String(order.id),
				order.productName,
				order.customerName,
				order.customerPhone,
				order.deliveryStatus,
				order.status,
			].some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}, [orders, query]);

	return (
		<section id="orders-section" className="mt-6 rounded-2xl bg-transparent">
			<h2 className="text-xl font-semibold tracking-tight">My orders</h2>
			<p className="mt-1 text-sm text-[var(--muted-foreground)]">Track your order status in real time</p>

			{isLoading ? (
				<div className="py-10 text-center text-sm text-[#6b705c]">Loading orders...</div>
			) : (
				<div className="mt-5 overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-2 text-sm">
						<thead>
							<tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
								<th className="px-3 py-2">ID</th>
								<th className="px-3 py-2">PRODUCT</th>
								<th className="px-3 py-2">QTY</th>
								<th className="px-3 py-2">DELIVERY DATE</th>
								<th className="px-3 py-2">STATUS</th>
								<th className="px-3 py-2">NOTE</th>
							</tr>
						</thead>
						<tbody>
							{visibleOrders.map((order) => (
								<tr key={order.id} className="align-top">
									<td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[#496553]">#{order.id}</td>
									<td className="bg-[var(--card)] px-3 py-3 font-semibold">{order.productName}</td>
									<td className="bg-[var(--card)] px-3 py-3 text-[#5f6f59]">{order.quantity}</td>
									<td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">{formatDate(order.deliveryDeadline)}</td>
									<td className="bg-[var(--card)] px-3 py-3">
										<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(order.status)}`}>
											{order.status}
										</span>
										<p className="mt-2 text-xs text-[#6b705c]">{order.deliveryStatus}</p>
									</td>
									<td className="rounded-r-lg bg-[var(--card)] px-3 py-3 text-xs text-[#6b705c]">{order.rejectionReason || order.managerNote || '—'}</td>
								</tr>
							))}

							{visibleOrders.length === 0 && (
								<tr>
									<td colSpan={6} className="px-3 py-8 text-center text-sm text-[#6b705c]">
										{query.trim() ? 'No orders match your search' : 'No orders yet'}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
