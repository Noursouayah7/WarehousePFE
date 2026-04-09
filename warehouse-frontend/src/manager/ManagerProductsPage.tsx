'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import ManagerSectionLayout from './ManagerSectionLayout';
import { getAdminProducts, AdminDashboardProduct } from '@/src/admin/ProductsDashbord/ProductDashbord.admin.api';

export default function ManagerProductsPage() {
  const { token } = useAuth();

  const [products, setProducts] = useState<AdminDashboardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'price' | 'quantity'>('latest');

  useEffect(() => {
    if (!token) {
      setError('Missing auth token. Please login again.');
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    async function loadData(activeToken: string) {
      try {
        const productsData = await getAdminProducts(activeToken);
        if (mounted) {
          setProducts(productsData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData(token);

    return () => {
      mounted = false;
    };
  }, [token]);

  const visibleProducts = [...products].sort((a, b) => {
    if (sortBy === 'price') return b.price - a.price;
    if (sortBy === 'quantity') return b.quantity - a.quantity;
    return b.id - a.id;
  });

  return (
    <ManagerSectionLayout
      title="Products"
      description="Browse inventory with a clean, data-first view."
    >
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as 'latest' | 'price' | 'quantity')}
          className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="latest">Sort: Latest</option>
          <option value="price">Sort: Price</option>
          <option value="quantity">Sort: Quantity</option>
        </select>
        <p className="text-sm text-[var(--muted-foreground)]">{visibleProducts.length} products</p>
      </section>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      <section className="rounded-2xl bg-transparent">
        <h2 className="text-lg font-semibold tracking-tight">Product inventory</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">View all products in the warehouse system.</p>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading products...</div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">NAME</th>
                  <th className="px-3 py-2">BLOC</th>
                  <th className="px-3 py-2">PRICE</th>
                  <th className="px-3 py-2">QUANTITY</th>
                  <th className="px-3 py-2">DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[#496553]">#{product.id}</td>
                    <td className="bg-[var(--card)] px-3 py-3 font-semibold">{product.name}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[#5f6f59]">#{product.blocId}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[#5f6f59]">${product.price.toFixed(2)}</td>
                    <td className="bg-[var(--card)] px-3 py-3 text-[#5f6f59]">{product.quantity}</td>
                    <td className="rounded-r-lg bg-[var(--card)] px-3 py-3 text-xs text-[#6b705c]">{product.description || '—'}</td>
                  </tr>
                ))}

                {visibleProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-sm text-[#6b705c]">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ManagerSectionLayout>
  );
}
