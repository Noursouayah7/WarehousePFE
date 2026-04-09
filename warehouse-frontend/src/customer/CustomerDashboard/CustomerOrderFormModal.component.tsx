'use client';

import { FormEvent } from 'react';

export type CustomerOrderForm = {
  productName: string;
  quantity: string;
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
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (updater: (current: CustomerOrderForm) => CustomerOrderForm) => void;
}

export function CustomerOrderFormModal({
  isOpen,
  isSending,
  formError,
  form,
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
          <input
            value={form.productName}
            onChange={(event) => onFormChange((current) => ({ ...current, productName: event.target.value }))}
            placeholder="Product name"
            className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
          />
          <input
            value={form.quantity}
            onChange={(event) => onFormChange((current) => ({ ...current, quantity: event.target.value }))}
            placeholder="Quantity"
            type="number"
            min={1}
            className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[#344e41] outline-none focus:border-[var(--color-info)]"
          />
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