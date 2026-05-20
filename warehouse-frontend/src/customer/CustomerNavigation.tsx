'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { label: 'Products', href: '/customer/products', icon: '📦' },
  { label: 'My Orders', href: '/customer/orders', icon: '🛒' },
  { label: 'Shipment Tracking', href: '/customer/shipment-tracking', icon: '🚚' },
  { label: 'Reclamations', href: '/customer/reclamations', icon: '📋' },
  { label: 'Profile', href: '/customer/profile', icon: '👤' },
];

export function CustomerNavigation() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-md rounded-lg mb-8"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex flex-wrap gap-2 md:gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </motion.button>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
