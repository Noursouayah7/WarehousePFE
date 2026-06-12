'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useI18n } from '@/src/i18n/I18nProvider';
import { getMyReclamations, createReclamation, getStatusLabel, getStatusColor, type ReclamationProblemType, type Reclamation } from '@/src/customer/reclamation.api';
import { motion } from 'framer-motion';

export default function ReclamationsPage() {
  const { token } = useAuth();
  const { tx } = useI18n();
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    problemType: 'PRODUCT_ISSUE' as ReclamationProblemType,
    description: '',
  });
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetchReclamations();
  }, [token]);

  const fetchReclamations = async () => {
    if (!token) {
      setError(tx('Missing auth token. Please login again.'));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getMyReclamations(token);
      setReclamations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx('Failed to fetch reclamations'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(tx('Missing auth token. Please login again.'));
      return;
    }

    try {
      setIsSubmitting(true);
      await createReclamation(
        token,
        formData.problemType,
        formData.description,
        undefined,
        undefined,
        attachmentUrl ?? undefined,
      );
      setFormData({
        problemType: 'PRODUCT_ISSUE',
        description: '',
      });
      setAttachmentUrl(null);
      setAttachmentName(null);
      setIsModalOpen(false);
      await fetchReclamations();
    } catch (err) {
      setError(err instanceof Error ? err.message : tx('Failed to create reclamation'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setAttachmentUrl(null);
      setAttachmentName(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachmentUrl(reader.result as string);
      setAttachmentName(file.name);
    };
    reader.readAsDataURL(file);
  };

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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{tx('Reclamations')}</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
          >
            {tx('New Reclamation')}
          </button>
        </div>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </motion.div>
      )}

      {reclamations.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <p className="text-gray-500 text-lg">{tx('No reclamations yet')}</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
          {reclamations.map((reclamation, idx) => (
            <motion.div
              key={reclamation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">{tx('Problem Type')}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {tx(reclamation.problemType.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{tx('Status')}</p>
                  <p className={`text-lg font-semibold ${getStatusColor(reclamation.status)}`}>
                    {tx(getStatusLabel(reclamation.status))}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">{tx('Description')}</p>
                <p className="text-gray-900">{reclamation.description}</p>
              </div>

              {reclamation.order && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-semibold text-gray-700">{tx('Related Order')}</p>
                  <p className="text-sm text-gray-600">
                    {reclamation.order.productName} x {reclamation.order.quantity} - {reclamation.order.status}
                  </p>
                </div>
              )}

              {reclamation.shipment && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-semibold text-gray-700">{tx('Related Shipment')}</p>
                  <p className="text-sm text-gray-600">
                    {reclamation.shipment.productName} x {reclamation.shipment.quantity} - {reclamation.shipment.status}
                  </p>
                  {reclamation.shipment.trackingNumber && (
                    <p className="text-sm text-gray-600">{tx('Tracking')}: {reclamation.shipment.trackingNumber}</p>
                  )}
                </div>
              )}

              {reclamation.managerNote && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700">{tx('Manager Note')}</p>
                  <p className="text-sm text-blue-900">{reclamation.managerNote}</p>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4 pt-4 border-t">
                {tx('Created')}: {new Date(reclamation.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* New Reclamation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{tx('New Reclamation')}</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{tx('Problem Type')}</label>
                <select
                  value={formData.problemType}
                  onChange={(e) =>
                    setFormData({ ...formData, problemType: e.target.value as ReclamationProblemType })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PRODUCT_ISSUE">{tx('Product Issue')}</option>
                  <option value="SHIPMENT_ISSUE">{tx('Shipment Issue')}</option>
                  <option value="ORDER_ISSUE">{tx('Order Issue')}</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{tx('Description')}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder={tx('Describe the issue in detail...')}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{tx('Attachment (optional)')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentChange}
                  className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                {attachmentUrl && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-700 truncate">{attachmentName ?? tx('Selected attachment')}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentUrl(null);
                          setAttachmentName(null);
                        }}
                        className="text-sm font-medium text-blue-700 hover:text-blue-900"
                      >
                        {tx('Remove')}
                      </button>
                    </div>
                    {attachmentUrl.startsWith('data:image') && (
                      <img src={attachmentUrl} alt="Attachment preview" className="mt-3 max-h-40 rounded-lg object-contain" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  {tx('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {isSubmitting ? tx('Submitting...') : tx('Submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
