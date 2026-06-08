'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { motion } from 'framer-motion';

type Shipment = {
  id: number;
  orderId: number | null;
  type: 'RESTOCK' | 'ORDER';
  productName: string;
  quantity: number;
  trackingNumber: string | null;
  expectedAt: string | null;
  receivedAt: string | null;
  status: 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED';
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchCustomerShipments(accessToken: string): Promise<Shipment[]> {
  const response = await fetch(`${API_URL}/shipments/my-shipments`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch shipments');
  }

  return data;
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    REQUESTED: 'bg-yellow-100 text-yellow-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    RECEIVED: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getStatusIcon(status: string) {
  const icons: Record<string, string> = {
    REQUESTED: '📦',
    IN_TRANSIT: '🚚',
    RECEIVED: '✅',
  };
  return icons[status] || '❓';
}

export default function ShipmentTrackingPage() {
  const { token } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShipments = useCallback(async () => {
    if (!token) {
      setError('Missing auth token. Please login again.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchCustomerShipments(token);
      setShipments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shipments');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void fetchShipments();
  }, [fetchShipments, token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shipment Tracking</h1>
        <p className="text-gray-600 mt-2">Track your orders and shipments in real-time</p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </motion.div>
      )}

      {shipments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <p className="text-gray-500 text-lg">No shipments yet</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
          {shipments.map((shipment, idx) => (
            <motion.div
              key={shipment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="text-lg font-semibold text-gray-900">{shipment.productName}</p>
                  <p className="text-sm text-gray-500">Qty: {shipment.quantity}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{getStatusIcon(shipment.status)}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-semibold text-gray-900">{shipment.type}</p>
                </div>
              </div>

              {shipment.trackingNumber && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700">Tracking Number</p>
                  <p className="text-lg font-mono text-blue-900">{shipment.trackingNumber}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                {shipment.expectedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Expected Delivery</p>
                    <p className="text-gray-900">{new Date(shipment.expectedAt).toLocaleDateString()}</p>
                  </div>
                )}

                {shipment.receivedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Received Date</p>
                    <p className="text-gray-900 font-semibold text-green-600">
                      {new Date(shipment.receivedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {shipment.note && (
                <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700">Notes</p>
                  <p className="text-sm text-gray-600">{shipment.note}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-4 border-t">
                Created: {new Date(shipment.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
