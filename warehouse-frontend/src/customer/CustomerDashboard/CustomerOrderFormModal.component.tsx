'use client';

import { FormEvent } from 'react';
import { CustomerProductOption } from '../customer.api';

export type CustomerOrderForm = {
  items: Array<{ productId: string; quantity: string }>;
  deliveryDeadline: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
};

interface CustomerOrderFormModalProps {
  isOpen: boolean;
  isSending: boolean;
  formError: string | null;
  form: CustomerOrderForm;
  products: CustomerProductOption[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (updater: (current: CustomerOrderForm) => CustomerOrderForm) => void;
}

export function CustomerOrderFormModal({
  isOpen,
  isSending,
  formError,
  form,
  products,
  onClose,
  onSubmit,
  onFormChange,
}: CustomerOrderFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#37352f]/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">New order</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--input)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"
          >
            Close
          </button>
        </div>

        {formError && (
          <div className="mb-4 rounded-lg border border-[var(--color-error)] bg-[#f8efe9] px-4 py-3 text-sm text-[var(--color-error)]">
            {formError}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="space-y-2">
            {form.items.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-lg border border-[var(--input)] bg-[#faf9f7] p-3 md:grid-cols-[1fr_120px_auto]">
                <select
                  value={item.productId}
                  onChange={(event) => {
                    const value = event.target.value;
                    onFormChange((current) => {
                      const nextItems = [...current.items];
                      nextItems[index] = { ...nextItems[index], productId: value };
                      return { ...current, items: nextItems };
                    });
                  }}
                  className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={String(product.id)}>
                      {product.name} - ${product.price.toFixed(2)} ({product.quantity} available)
                    </option>
                  ))}
                </select>

                <input
                  value={item.quantity}
                  onChange={(event) => {
                    const value = event.target.value;
                    onFormChange((current) => {
                      const nextItems = [...current.items];
                      nextItems[index] = { ...nextItems[index], quantity: value };
                      return { ...current, items: nextItems };
                    });
                  }}
                  placeholder="Qty"
                  type="number"
                  min={1}
                  className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
                />

                <button
                  type="button"
                  onClick={() => {
                    onFormChange((current) => ({
                      ...current,
                      items: current.items.filter((_, currentIndex) => currentIndex !== index),
                    }));
                  }}
                  disabled={form.items.length === 1}
                  className="rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[var(--muted-foreground)] disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              onFormChange((current) => ({
                ...current,
                items: [...current.items, { productId: '', quantity: '1' }],
              }))
            }
            className="rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)]"
          >
            Add product
          </button>

          <input
            value={form.deliveryDeadline}
            onChange={(event) => onFormChange((current) => ({ ...current, deliveryDeadline: event.target.value }))}
            placeholder="Delivery date"
            type="datetime-local"
            aria-label="Delivery date"
            className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
          />
          <input
            value={form.deliveryAddress}
            onChange={(event) => onFormChange((current) => ({ ...current, deliveryAddress: event.target.value }))}
            placeholder="Delivery address"
            className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
          />
          <input
            value={form.customerName}
            onChange={(event) => onFormChange((current) => ({ ...current, customerName: event.target.value }))}
            placeholder="Your name"
            className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
          />
          <input
            value={form.customerPhone}
            onChange={(event) => onFormChange((current) => ({ ...current, customerPhone: event.target.value }))}
            placeholder="Your phone"
            type="tel"
            inputMode="numeric"
            maxLength={8}
            pattern="[0-9]{8}"
            className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
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
  );
}