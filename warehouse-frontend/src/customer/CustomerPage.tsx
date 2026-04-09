'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import {
  createCustomerOrder,
  CustomerOrder,
  CustomerOrderStatus,
  CustomerProductOption,
  getCustomerOrders,
  getCustomerProductOptions,
} from './customer.api';

type CustomerOrderForm = {
  productName: string;
  quantity: string;
  deliveryDeadline: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
};

const emptyForm: CustomerOrderForm = {
  productName: '',
  quantity: '',
  deliveryDeadline: '',
  deliveryAddress: '',
  customerName: '',
  customerPhone: '',
};

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

export default function CustomerPage() {
  const { token, logout } = useAuth();

  const [products, setProducts] = useState<CustomerProductOption[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'products' | 'orders' | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerOrderForm>(emptyForm);

  async function loadData(activeToken: string) {
    const [productData, orderData] = await Promise.all([
      getCustomerProductOptions(activeToken),
      getCustomerOrders(activeToken),
    ]);

    setProducts(productData);
    setOrders(orderData);
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

  function openOrderForm(productName: string) {
    setForm((current) => ({
      ...emptyForm,
      customerName: current.customerName,
      customerPhone: current.customerPhone,
      deliveryAddress: current.deliveryAddress,
      productName,
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

    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setFormError('Quantity must be greater than 0.');
      return;
    }

    if (!form.productName.trim()) {
      setFormError('Product name is required.');
      return;
    }

    if (!/^\d{8}$/.test(form.customerPhone.trim())) {
      setFormError('Phone number must contain exactly 8 digits.');
      return;
    }

    setIsSending(true);
    setFormError(null);
    setError(null);

    try {
      const createdOrder = await createCustomerOrder(token, {
        productName: form.productName.trim(),
        quantity,
        deliveryDeadline: form.deliveryDeadline,
        deliveryAddress: form.deliveryAddress.trim(),
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
      });

      setOrders((current) => [createdOrder, ...current]);
      setIsFormOpen(false);
      setForm((current) => ({
        ...emptyForm,
        customerName: current.customerName,
        customerPhone: current.customerPhone,
        deliveryAddress: current.deliveryAddress,
      }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] text-[#344e41]">
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
            onClick={logout}
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
            onClick={() => setActiveSection(activeSection === 'products' ? null : 'products')}
            className={`text-left rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
              activeSection === 'products'
                ? 'border-[var(--color-info)] bg-[#edf2ee]'
                : 'border-[#a3b18a] bg-[#f5f1e8] hover:border-[var(--color-info)] hover:bg-[#edf2ee]'
            }`}
          >
            <div className="mb-4 h-6 w-[3px] bg-[var(--role-customer)]" />
            <p className="mb-2 text-base font-semibold text-[var(--role-customer)]">Available products</p>
            <p className="text-[28px] font-bold">{products.length}</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'orders' ? null : 'orders')}
            className={`text-left rounded-2xl border p-6 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer ${
              activeSection === 'orders'
                ? 'border-[var(--color-warning)] bg-[#f6eddc]'
                : 'border-[#a3b18a] bg-[#f5f1e8] hover:border-[var(--color-warning)] hover:bg-[#f6eddc]'
            }`}
          >
            <div className="mb-4 h-6 w-[3px] bg-[var(--role-admin)]" />
            <p className="mb-2 text-base font-semibold text-[var(--role-admin)]">My orders</p>
            <p className="text-[28px] font-bold">{orders.length}</p>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection(activeSection === 'orders' ? null : 'orders')}
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

        {error && (
          <div className="mt-6 rounded-lg border border-[var(--color-error)] bg-[#f8efe9] px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}

        {activeSection && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setActiveSection(null)}
              className="rounded-lg border border-[#d6d3cc] bg-transparent px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
            >
              View all
            </button>
          </div>
        )}

        {(!activeSection || activeSection === 'products') && (
          <section id="products-section" className="mt-10 rounded-2xl border border-[#a3b18a] bg-[#f5f1e8] p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">Products</h2>
          <p className="mt-1 text-sm text-[#6b705c]">Click on a product to place an order</p>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-[#6b705c]">Loading products...</div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <button
                  key={product.name}
                  type="button"
                  onClick={() => openOrderForm(product.name)}
                  className="text-left rounded-xl border border-[#a3b18a] bg-[#f5f1e8] p-4 transition-colors hover:border-[var(--color-info)] hover:bg-[#edf2ee]"
                >
                  <p className="text-[16px] font-bold tracking-[0.06em] text-[var(--color-info)]">{product.name}</p>
                  <p className="mt-3 text-xs text-[#6b705c]">Click to order</p>
                </button>
              ))}

              {products.length === 0 && (
                <div className="col-span-full border border-[#a3b18a] bg-[#f5f1e8] p-8 text-center text-sm text-[#6b705c]">
                  No products available right now
                </div>
              )}
            </div>
          )}
          </section>
        )}

        {(!activeSection || activeSection === 'orders') && (
          <section id="orders-section" className="mt-10 rounded-2xl border border-[#a3b18a] bg-[#f5f1e8] p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">My orders</h2>
          <p className="mt-1 text-sm text-[#6b705c]">Track your order status in real time</p>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-[#6b705c]">Loading orders...</div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border border-[#a3b18a] text-sm">
                <thead>
                  <tr className="border-b border-[#b7c2a0] text-left text-xs font-medium text-[#6b705c]">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">PRODUCT</th>
                    <th className="px-3 py-2">QTY</th>
                    <th className="px-3 py-2">DELIVERY DATE</th>
                    <th className="px-3 py-2">STATUS</th>
                    <th className="px-3 py-2">NOTE</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#a3b18a] align-top">
                      <td className="px-3 py-3 text-[#496553]">#{order.id}</td>
                      <td className="px-3 py-3 font-semibold">{order.productName}</td>
                      <td className="px-3 py-3 text-[#5f6f59]">{order.quantity}</td>
                      <td className="px-3 py-3 text-xs text-[#5f6f59]">{formatDate(order.deliveryDeadline)}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block border px-2 py-1 text-xs ${statusClasses(order.status)}`}>
                          {order.status}
                        </span>
                        <p className="mt-2 text-xs text-[#6b705c]">{order.deliveryStatus}</p>
                      </td>
                      <td className="px-3 py-3 text-xs text-[#6b705c]">
                        {order.rejectionReason || order.managerNote || '—'}
                      </td>
                    </tr>
                  ))}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[#6b705c]">
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          </section>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#344e41]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-[#b7c2a0] bg-[#f5f1e8] p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">New order</h3>
              <button
                type="button"
                onClick={closeOrderForm}
                className="rounded-lg border border-[#d6d3cc] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"
              >
                Close
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-[var(--color-error)] bg-[#f8efe9] px-4 py-3 text-sm text-[var(--color-error)]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSendOrder} className="grid gap-3">
              <input
                value={form.productName}
                onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value }))}
                placeholder="Product name"
                className="w-full rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
              />
              <input
                value={form.quantity}
                onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                placeholder="Quantity"
                type="number"
                min={1}
                className="w-full rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
              />
              <input
                value={form.deliveryDeadline}
                onChange={(event) => setForm((current) => ({ ...current, deliveryDeadline: event.target.value }))}
                placeholder="Delivery date"
                type="datetime-local"
                aria-label="Delivery date"
                className="w-full rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
              />
              <input
                value={form.deliveryAddress}
                onChange={(event) => setForm((current) => ({ ...current, deliveryAddress: event.target.value }))}
                placeholder="Delivery address"
                className="w-full rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
              />
              <input
                value={form.customerName}
                onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
                placeholder="Your name"
                className="w-full rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
              />
              <input
                value={form.customerPhone}
                onChange={(event) => setForm((current) => ({ ...current, customerPhone: event.target.value }))}
                placeholder="Your phone"
                type="tel"
                inputMode="numeric"
                maxLength={8}
                pattern="[0-9]{8}"
                className="w-full rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
              />

              <button
                type="submit"
                disabled={isSending}
                className="mt-2 rounded-lg border border-[var(--color-info)] bg-[#edf2ee] px-4 py-2 text-sm font-medium text-[var(--color-info)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isSending ? 'Sending order...' : 'Send order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
