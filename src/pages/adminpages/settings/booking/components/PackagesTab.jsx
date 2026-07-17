import { useState, useEffect, useRef } from 'react';
import { getPackages, createPackage, updatePackage, deletePackage, reorderPackages } from '../service/bookingService';
import PackageModal from './PackageModal';
import { formatDurationLabel } from '../utils/durationDisplay';

const TYPE_COLORS = {
  service: 'bg-blue-100 text-blue-800',
  consultation: 'bg-purple-100 text-purple-800',
  studio: 'bg-green-100 text-green-800',
};

export default function PackagesTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editPackage, setEditPackage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragNode = useRef(null);

  useEffect(() => {
    loadPackages();
  }, [filterType]);

  const loadPackages = async () => {
    setLoading(true);
    setProgress(30);
    const params = filterType ? { type: filterType } : {};
    const data = await getPackages(params);
    if (data?.packages) {
      setPackages(data.packages);
    }
    setLoading(false);
    setProgress(100);
  };

  const handleCreate = () => {
    setEditPackage(null);
    setModalOpen(true);
  };

  const handleEdit = (pkg) => {
    setEditPackage(pkg);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editPackage) {
      await updatePackage(editPackage._id, formData);
    } else {
      await createPackage(formData);
    }
    setModalOpen(false);
    loadPackages();
  };

  const handleDelete = async (id) => {
    await deletePackage(id);
    setDeleteConfirm(null);
    loadPackages();
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    dragNode.current = e.target;
    e.target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = async (e) => {
    e.target.style.opacity = '1';
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newPackages = [...packages];
      const [draggedItem] = newPackages.splice(draggedIndex, 1);
      newPackages.splice(dragOverIndex, 0, draggedItem);
      setPackages(newPackages);
      
      const orderedIds = newPackages.map((pkg) => pkg._id);
      await reorderPackages(orderedIds);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNode.current = null;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="service">Service</option>
            <option value="consultation">Consultation</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Package
        </button>
      </div>

      {/* Drag hint */}
      {packages.length > 1 && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          Drag rows to reorder packages. Order updates on frontend automatically.
        </p>
      )}

      {/* Packages Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new package.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  <span className="sr-only">Drag</span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {packages.map((pkg, index) => (
                <tr
                  key={pkg._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  className={`hover:bg-gray-50 cursor-move transition-all ${
                    dragOverIndex === index ? 'bg-primary/10 border-t-2 border-primary' : ''
                  } ${draggedIndex === index ? 'opacity-50' : ''}`}
                >
                  <td className="px-3 py-4 whitespace-nowrap">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {pkg.image && (
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                        {pkg.highlightBadgeEnabled ? (
                          <div className="mt-1 inline-flex items-center rounded-full bg-lime-100 px-2 py-0.5 text-xs font-medium text-lime-900">
                            Badge: {pkg.highlightBadgeText || 'Most Popular'}
                          </div>
                        ) : null}
                        {pkg.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {pkg.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${TYPE_COLORS[pkg.type]}`}>
                      {pkg.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDurationLabel(pkg.durationMinutes, pkg.durationDisplayUnit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    £{pkg.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-primary hover:text-secondary mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(pkg._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Package Modal */}
      <PackageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        editPackage={editPackage}
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Package</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this package? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
