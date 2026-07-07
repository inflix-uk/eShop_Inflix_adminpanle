import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import ImageUploader from '../../../banners/components/ImageUploader';
import { uploadPackageImage } from '../service/bookingService';
import { tinymcePackageDescriptionInit } from './tinymcePackageConfig';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

const PACKAGE_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'studio', label: 'Studio' },
];

function resolveImagePreview(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return `${API_BASE_URL}${url}`;
  }
  if (url.startsWith('/')) {
    return `${API_BASE_URL}/uploads${url}`;
  }
  return `${API_BASE_URL}/uploads/${url}`;
}

const EMPTY_EXTRA = { image: '', title: '', price: 0, description: '' };

export default function PackageModal({ isOpen, onClose, onSave, editPackage }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'service',
    durationMinutes: 30,
    price: 0,
    description: '',
    detailPage: '',
    features: [''],
    extras: [],
    image: '',
    isActive: true,
    highlightBadgeEnabled: false,
    highlightBadgeText: 'Most Popular',
    highlightBadgeUrl: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingExtraIndex, setUploadingExtraIndex] = useState(null);
  const [extraImagePreviews, setExtraImagePreviews] = useState({});
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editPackage) {
      const image = editPackage.image || '';
      setFormData({
        name: editPackage.name || '',
        type: editPackage.type || 'service',
        durationMinutes: editPackage.durationMinutes || 30,
        price: editPackage.price || 0,
        description: editPackage.description || '',
        detailPage: editPackage.detailPage || '',
        features:
          Array.isArray(editPackage.features) && editPackage.features.length > 0
            ? editPackage.features
            : [''],
        extras: Array.isArray(editPackage.extras)
          ? editPackage.extras.map((extra) => ({
              image: extra.image || '',
              title: extra.title || '',
              price: extra.price ?? 0,
              description: extra.description || '',
            }))
          : [],
        image,
        isActive: editPackage.isActive !== false,
        highlightBadgeEnabled: Boolean(editPackage.highlightBadgeEnabled),
        highlightBadgeText: editPackage.highlightBadgeText || 'Most Popular',
        highlightBadgeUrl: editPackage.highlightBadgeUrl || '',
      });
      setImagePreview(image ? resolveImagePreview(image) : '');
      const previews = {};
      (editPackage.extras || []).forEach((extra, index) => {
        if (extra?.image) previews[index] = resolveImagePreview(extra.image);
      });
      setExtraImagePreviews(previews);
    } else {
      setFormData({
        name: '',
        type: 'service',
        durationMinutes: 30,
        price: 0,
        description: '',
        detailPage: '',
        features: [''],
        extras: [],
        image: '',
        isActive: true,
        highlightBadgeEnabled: false,
        highlightBadgeText: 'Most Popular',
        highlightBadgeUrl: '',
      });
      setImagePreview('');
      setExtraImagePreviews({});
    }
  }, [editPackage, isOpen]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => {
      const features = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: features.length > 0 ? features : [''] };
    });
  };

  const addExtra = () => {
    setFormData((prev) => ({ ...prev, extras: [...prev.extras, { ...EMPTY_EXTRA }] }));
  };

  const removeExtra = (index) => {
    setFormData((prev) => ({
      ...prev,
      extras: prev.extras.filter((_, i) => i !== index),
    }));
    setExtraImagePreviews((prev) => {
      const next = { ...prev };
      delete next[index];
      const reindexed = {};
      Object.keys(next).forEach((key) => {
        const num = Number(key);
        if (num > index) reindexed[num - 1] = next[key];
        else reindexed[num] = next[key];
      });
      return reindexed;
    });
  };

  const handleExtraChange = (index, field, value) => {
    setFormData((prev) => {
      const extras = [...prev.extras];
      extras[index] = { ...extras[index], [field]: value };
      return { ...prev, extras };
    });
  };

  const handleExtraImageChange = async (index, file) => {
    if (!file) {
      handleExtraChange(index, 'image', '');
      setExtraImagePreviews((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
      return;
    }

    setUploadingExtraIndex(index);
    const localPreview = URL.createObjectURL(file);
    setExtraImagePreviews((prev) => ({ ...prev, [index]: localPreview }));

    try {
      const imageUrl = await uploadPackageImage(file);
      if (imageUrl) {
        handleExtraChange(index, 'image', imageUrl);
        setExtraImagePreviews((prev) => ({ ...prev, [index]: resolveImagePreview(imageUrl) }));
      } else {
        setExtraImagePreviews((prev) => {
          const next = { ...prev };
          const saved = formData.extras[index]?.image;
          if (saved) next[index] = resolveImagePreview(saved);
          else delete next[index];
          return next;
        });
      }
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingExtraIndex(null);
    }
  };

  const handleImageChange = async (file) => {
    if (!file) {
      handleChange('image', '');
      setImagePreview('');
      return;
    }

    setUploadingImage(true);
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      const imageUrl = await uploadPackageImage(file);
      if (imageUrl) {
        handleChange('image', imageUrl);
        setImagePreview(resolveImagePreview(imageUrl));
      } else {
        setImagePreview(formData.image ? resolveImagePreview(formData.image) : '');
      }
    } finally {
      URL.revokeObjectURL(localPreview);
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (uploadingImage || uploadingExtraIndex !== null) return;

    setSaving(true);
    const payload = {
      ...formData,
      highlightBadgeText: formData.highlightBadgeText?.trim() || 'Most Popular',
      highlightBadgeUrl: formData.highlightBadgeUrl?.trim() || '',
      features: formData.features
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
      extras: formData.extras
        .map((extra) => ({
          image: extra.image || '',
          title: extra.title.trim(),
          price: Number(extra.price) || 0,
          description: extra.description.trim(),
        }))
        .filter((extra) => extra.title.length > 0),
    };
    await onSave(payload);
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editPackage ? 'Edit Package' : 'Create Package'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="e.g., Haircut, Consultation Call"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                >
                  {PACKAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  min={5}
                  value={formData.durationMinutes}
                  onChange={(e) => handleChange('durationMinutes', Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (£) *
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) => handleChange('price', Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Short summary shown on the booking card listing.
              </p>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <Editor
                  key={editPackage?._id || 'new-package'}
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  onInit={(_evt, editor) => {
                    editorRef.current = editor;
                  }}
                  value={formData.description}
                  init={tinymcePackageDescriptionInit}
                  onEditorChange={(content) => handleChange('description', content)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Feature Bullets
                </label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm text-primary hover:text-secondary font-medium"
                >
                  + Add bullet
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Shown as checkmark list on the booking page card.
              </p>
              <div className="space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      placeholder="e.g., 30 minute session"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                      title="Remove bullet"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <ImageUploader
                label="Package Image"
                helperText="Upload an image for this service. Stored on S3/Spaces (max 5MB)."
                value={imagePreview}
                onChange={handleImageChange}
                maxSizeMB={5}
              />
              {uploadingImage && (
                <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="highlightBadgeEnabled"
                  checked={formData.highlightBadgeEnabled}
                  onChange={(e) => handleChange('highlightBadgeEnabled', e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary rounded border-gray-300"
                />
                <div className="flex-1">
                  <label htmlFor="highlightBadgeEnabled" className="text-sm font-medium text-gray-900">
                    Show highlight badge on booking card
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Only one package can have this badge at a time. It appears at the top of the card on the booking page.
                  </p>
                </div>
              </div>

              {formData.highlightBadgeEnabled ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge text
                    </label>
                    <input
                      type="text"
                      value={formData.highlightBadgeText}
                      onChange={(e) => handleChange('highlightBadgeText', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      placeholder="Most Popular"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge link URL (optional)
                    </label>
                    <input
                      type="url"
                      value={formData.highlightBadgeUrl}
                      onChange={(e) => handleChange('highlightBadgeUrl', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                      placeholder="https://example.com/page"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      If set, clicking the badge opens this URL in a new tab.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleChange('isActive', e.target.checked)}
                className="h-4 w-4 text-primary rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active (visible to customers)
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Extras
                </label>
                <button
                  type="button"
                  onClick={addExtra}
                  className="text-sm text-primary hover:text-secondary font-medium"
                >
                  + Add extra
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Optional add-ons customers can choose with this package.
              </p>

              {formData.extras.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
                  No extras yet. Click &quot;Add extra&quot; to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.extras.map((extra, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-800">
                          Extra {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeExtra(index)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                          title="Remove extra"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <ImageUploader
                        label="Extra Image"
                        helperText="Optional image for this extra (max 5MB)."
                        value={extraImagePreviews[index] || (extra.image ? resolveImagePreview(extra.image) : '')}
                        onChange={(file) => handleExtraImageChange(index, file)}
                        maxSizeMB={5}
                      />
                      {uploadingExtraIndex === index && (
                        <p className="text-sm text-gray-500">Uploading image...</p>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={extra.title}
                          onChange={(e) => handleExtraChange(index, 'title', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                          placeholder="e.g., Extra microphone"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (£)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={extra.price}
                          onChange={(e) => handleExtraChange(index, 'price', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={extra.description}
                          onChange={(e) => handleExtraChange(index, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                          placeholder="Short description of this extra"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detail Page
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Full content shown when a customer opens the package detail page.
              </p>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <Editor
                  key={`${editPackage?._id || 'new-package'}-detail`}
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  value={formData.detailPage}
                  init={tinymcePackageDescriptionInit}
                  onEditorChange={(content) => handleChange('detailPage', content)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingImage || uploadingExtraIndex !== null}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
              >
                {saving ? 'Saving...' : editPackage ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
