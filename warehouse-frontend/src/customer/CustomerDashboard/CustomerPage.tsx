'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import {
  createCustomerOrder,
  CustomerOrder,
  CustomerProductOption,
  getCustomerOrders,
  getCustomerProductOptions,
} from '../customer.api';
import { ProfileService, UserProfile } from '@/src/services/profileService';
import { CustomerProduct } from './CustomerProduct.component';
import { CustomerMyOrder } from './CustomerMyOrder.component';
import { CustomerOrderForm, CustomerOrderFormModal } from './CustomerOrderFormModal.component';

const emptyForm: CustomerOrderForm = {
  items: [{ productId: '', quantity: '1' }],
  deliveryDeadline: '',
  deliveryAddress: '',
  customerName: '',
  customerPhone: '',
};

const minimumDeliveryDelayMs = 10 * 24 * 60 * 60 * 1000;

function getDeliveryWarning(deliveryDeadline: string): string | null {
  if (!deliveryDeadline) {
    return null;
  }

  const selectedDate = new Date(deliveryDeadline);
  if (Number.isNaN(selectedDate.getTime())) {
    return 'Choose a valid delivery date.';
  }

  const delta = selectedDate.getTime() - Date.now();
  if (delta < minimumDeliveryDelayMs) {
    return 'Delivery must be scheduled at least 10 days in advance.';
  }

  return null;
}

function getCustomerOrderErrorMessage(error: unknown): string {
  const fallback = 'We could not create your order. Please review your request and try again.';

  if (!(error instanceof Error)) {
    return fallback;
  }

  const lowerMessage = error.message.toLowerCase();
  if (lowerMessage.includes('stock') || lowerMessage.includes('available') || lowerMessage.includes('inventory')) {
    return 'One or more selected products cannot be fulfilled right now. Please refresh the product list and try again.';
  }

  return error.message || fallback;
}

export default function CustomerPage() {
  const { token } = useAuth();

  const [products, setProducts] = useState<CustomerProductOption[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'overview' | 'products' | 'orders'>(() => {
    if (typeof window === 'undefined') return 'overview';
    const path = window.location.pathname;
    if (path.endsWith('/orders')) return 'orders';
    if (path.endsWith('/products')) return 'products';
    return 'overview';
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('ALL');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerOrderForm>(emptyForm);
  const [deliveryNotice, setDeliveryNotice] = useState<string | null>(null);
  const [lastDeliveredOrderId, setLastDeliveredOrderId] = useState<number | null>(null);
  const deliveryWarning = useMemo(() => getDeliveryWarning(form.deliveryDeadline), [form.deliveryDeadline]);

  async function loadData(activeToken: string) {
    const [productData, orderData] = await Promise.all([
      getCustomerProductOptions(activeToken),
      getCustomerOrders(activeToken),
    ]);

    setProducts(productData);
    setOrders(orderData);

    const delivered = orderData.find((order) => order.deliveryStatus === 'DELIVERED' && order.id !== lastDeliveredOrderId);
    if (delivered) {
      setDeliveryNotice(`Order #${delivered.id} has been delivered.`);
      setLastDeliveredOrderId(delivered.id);
    }

    const userProfile = await ProfileService.getProfile(activeToken);
    setProfile(userProfile);
    setForm((current) => ({
      ...current,
      customerName: current.customerName || userProfile.name || '',
      customerPhone: current.customerPhone || userProfile.phone || '',
      deliveryAddress: current.deliveryAddress || userProfile.address || '',
    }));
  }

  useEffect(() => {
    if (!token) {
      setError('Missing auth token. Please login again.');
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    void loadData(token)
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load customer dashboard');
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders],
  );

  const visibleOrders = useMemo(() => {
    if (statusFilter === 'ALL') return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  function openOrderForm(product?: CustomerProductOption) {
    setForm((current) => ({
      ...emptyForm,
      items: [
        {
          productId: product ? String(product.id) : '',
          quantity: '1',
        },
      ],
      customerName: current.customerName || profile?.name || '',
      customerPhone: current.customerPhone || profile?.phone || '',
      deliveryAddress: current.deliveryAddress || profile?.address || '',
    }));
    setFormError(null);
    setIsFormOpen(true);
  }

  function closeOrderForm() {
    if (isSending) return;
    setIsFormOpen(false);
    setFormError(null);
  }

  async function handleSendOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    const normalizedItems = form.items
      .map((item) => ({ productId: Number(item.productId), quantity: Number(item.quantity) }))
      .filter((item) => Number.isFinite(item.productId) && item.productId > 0 && Number.isFinite(item.quantity) && item.quantity > 0);

    if (normalizedItems.length === 0) {
      setFormError('Add at least one valid product.');
      return;
    }

    if (!/^\d{8}$/.test(form.customerPhone.trim())) {
      setFormError('Phone number must contain exactly 8 digits.');
      return;
    }

    if (deliveryWarning) {
      setFormError(deliveryWarning);
      return;
    }

    setIsSending(true);
    setFormError(null);
    setError(null);

    try {
      const createdOrder = await createCustomerOrder(token, {
        items: normalizedItems,
        deliveryDeadline: form.deliveryDeadline,
        deliveryAddress: form.deliveryAddress.trim(),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
      });

      setOrders((current) => [createdOrder, ...current]);
      setIsFormOpen(false);
      setForm((current) => ({
        ...emptyForm,
        customerName: current.customerName || profile?.name || '',
        customerPhone: current.customerPhone || profile?.phone || '',
        deliveryAddress: current.deliveryAddress || profile?.address || '',
      }));
    } catch (err) {
      setFormError(getCustomerOrderErrorMessage(err));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={() => setView('products')}
          className="text-left rounded-xl bg-[var(--card)] p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Products</p>
          <p className="mt-2 text-3xl font-semibold">{products.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setView('orders')}
          className="text-left rounded-xl bg-[var(--card)] p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Orders</p>
          <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
        </button>
        <button
          type="button"
          onClick={() => setView('orders')}
          className="text-left rounded-xl bg-[var(--card)] p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Pending review</p>
          <p className="mt-2 text-3xl font-semibold">{pendingOrdersCount}</p>
        </button>
      </section>

      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md bg-[#f3f3f1] p-1">
          {([
            { key: 'overview', label: 'Overview' },
            { key: 'products', label: 'Products' },
            { key: 'orders', label: 'Orders' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setView(tab.key)}
              className={[
                'rounded px-3 py-1.5 text-sm transition-colors',
                view === tab.key
                  ? 'bg-white text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => openOrderForm()}
            className="rounded-md bg-[#eef3ef] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[#e5eee6]"
          >
            New order
          </button>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED')}
            className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="ALL">Filter: All statuses</option>
            <option value="PENDING">Filter: Pending</option>
            <option value="APPROVED">Filter: Approved</option>
            <option value="REJECTED">Filter: Rejected</option>
            <option value="COMPLETED">Filter: Completed</option>
          </select>
        </div>
      </section>

      <div>
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
            <span aria-hidden="true">!</span>
            {error}
          </div>
        )}

        {deliveryNotice && (
          <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-[var(--tint-success)] px-3 py-2 text-sm text-[var(--color-success)]">
            <p>{deliveryNotice}</p>
            <button type="button" onClick={() => setDeliveryNotice(null)} className="text-xs font-medium text-[var(--color-success)]">
              Dismiss
            </button>
          </div>
        )}

        {(view === 'overview' || view === 'products') && (
          <CustomerProduct products={products} isLoading={isLoading} onSelectProduct={openOrderForm} />
        )}

        {(view === 'overview' || view === 'orders') && (
          <CustomerMyOrder orders={visibleOrders} isLoading={isLoading} />
        )}
      </div>

      <CustomerOrderFormModal
        isOpen={isFormOpen}
        isSending={isSending}
        formError={formError}
        form={form}
        products={products}
        deliveryWarning={deliveryWarning}
        onClose={closeOrderForm}
        onSubmit={handleSendOrder}
        onFormChange={setForm}
      />
    </div>
  );
}
