'use client';

import { useMemo } from 'react';
import { CustomerOrder, CustomerOrderStatus, CustomerShipmentStatus } from '../customer.api';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import { useI18n } from '@/src/i18n/I18nProvider';

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
			return 'border-[var(--color-success)] bg-[var(--tint-success)] text-[var(--color-success)]';
	}

	if (status === 'REJECTED') {
			return 'border-[var(--color-error)] bg-[var(--tint-error)] text-[var(--color-error)]';
	}

	if (status === 'RESTOCK_REQUESTED') {
			return 'border-[var(--color-warning)] bg-[var(--tint-warning)] text-[var(--color-warning)]';
	}

		return 'border-[var(--color-info)] bg-[var(--tint-info)] text-[var(--color-info)]';
}

function shipmentStatusClasses(status: CustomerShipmentStatus): string {
	if (status === 'IN_TRANSIT') {
		return 'bg-[var(--tint-info)] text-[var(--color-info)]';
	}

	if (status === 'RECEIVED') {
		return 'bg-[var(--tint-success)] text-[var(--color-success)]';
	}

	return 'bg-[var(--tint-warning)] text-[var(--color-warning)]';
}

function formatOrderStatus(status: CustomerOrderStatus, tx: (text: string) => string): string {
	const labels: Record<CustomerOrderStatus, string> = {
		PENDING: 'Pending',
		APPROVED: 'Approved',
		REJECTED: 'Rejected',
		RESTOCK_REQUESTED: 'Restock requested',
		COMPLETED: 'Completed',
	};

	return tx(labels[status] ?? status);
}

function formatDeliveryStatus(status: string, tx: (text: string) => string): string {
	return tx(status.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()));
}

function formatShipmentStatus(status: CustomerShipmentStatus, tx: (text: string) => string): string {
	if (status === 'IN_TRANSIT') return tx('In transit');
	if (status === 'RECEIVED') return tx('Delivered');
	return tx('Requested');
}

export function CustomerMyOrder({ orders, isLoading }: CustomerMyOrderProps) {
	const { query } = useWorkspaceSearch();
	const { tx } = useI18n();
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
								...order.shipments.map((shipment) => shipment.status),
							].some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}, [orders, query]);

	return (
		<section id="orders-section" className="mt-6 rounded-2xl bg-transparent">
			<h2 className="text-xl font-semibold tracking-tight">{tx('My orders')}</h2>
			<p className="mt-1 text-sm text-[var(--muted-foreground)]">{tx('Track your order status in real time')}</p>

			{isLoading ? (
				<div className="py-10 text-center text-sm text-[var(--muted-foreground)]">{tx('Loading orders...')}</div>
			) : (
				<div className="mt-5 overflow-x-auto">
					<table className="min-w-full border-separate border-spacing-y-2 text-sm">
						<thead>
							<tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
								<th className="px-3 py-2">ID</th>
								<th className="px-3 py-2">{tx('PRODUCT')}</th>
								<th className="px-3 py-2">{tx('QTY')}</th>
								<th className="px-3 py-2">{tx('DELIVERY DATE')}</th>
								<th className="px-3 py-2">{tx('STATUS')}</th>
								<th className="px-3 py-2">{tx('SHIPMENT')}</th>
								<th className="px-3 py-2">{tx('NOTE')}</th>
							</tr>
						</thead>
						<tbody>
							{visibleOrders.map((order) => (
								<tr key={order.id} className="align-top">
									<td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[var(--foreground)]">#{order.id}</td>
									<td className="bg-[var(--card)] px-3 py-3 font-semibold">{order.productName}</td>
									<td className="bg-[var(--card)] px-3 py-3 text-[var(--muted-foreground)]">
										<p>{order.quantity}</p>
										<p className="text-xs text-[var(--muted-foreground)]">${order.totalAmount.toFixed(2)}</p>
									</td>
									<td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">{formatDate(order.deliveryDeadline)}</td>
									<td className="bg-[var(--card)] px-3 py-3">
										<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(order.status)}`}>
											{formatOrderStatus(order.status, tx)}
										</span>
										<p className="mt-2 text-xs text-[var(--muted-foreground)]">{formatDeliveryStatus(order.deliveryStatus, tx)}</p>
									</td>
									<td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
										{order.shipments.length > 0 ? (
											<div className="space-y-2">
												{order.shipments.map((shipment) => (
													<div key={shipment.id}>
														<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${shipmentStatusClasses(shipment.status)}`}>
															{formatShipmentStatus(shipment.status, tx)}
														</span>
														<p className="mt-1">
															#{shipment.id} · {shipment.productName} x{shipment.quantity}
														</p>
													</div>
												))}
											</div>
										) : (
											'—'
										)}
									</td>
									<td className="rounded-r-lg bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
										{order.items.length > 0 ? (
											<div className="space-y-1">
												{order.items.map((item) => (
													<p key={item.id}>
														{item.productName} x{item.quantity}
													</p>
												))}
											</div>
										) : (
											order.rejectionReason || order.managerNote || '—'
										)}
									</td>
								</tr>
							))}

							{visibleOrders.length === 0 && (
								<tr>
									<td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
										{query.trim() ? tx('No orders match your search') : tx('No orders yet')}
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
