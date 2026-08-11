import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import ImageUploader from '../../../banners/components/ImageUploader';
import MediaLibraryPicker from '../../../media/components/media/MediaLibraryPicker';
import { uploadPackageImage } from '../service/bookingService';
import { tinymcePackageDescriptionInit } from './tinymcePackageConfig';
import {
  UnitToggle,
  displayValueToMinutes,
  minutesToDisplayValue,
  normalizeDurationUnit,
} from '../utils/durationDisplay';

const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

const PACKAGE_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'studio', label: 'Studio' },
  { value: 'editing', label: 'Editing' },
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

const EMPTY_EXTRA = {
  image: '',
  title: '',
  price: 0,
  description: '',
  quantityEnabled: false,
};

const DEFAULT_WHAT_HAPPENS_NEXT = {
  heading: 'What happens next',
  listStyle: 'numbered',
  items: [
    'Confirmation and calendar invite by email straight away.',
    'Free parking at the back of the studio — no app, no permit.',
    'Arrive 5 minutes early. The room is already rigged and tested.',
    'Leave with your raw files. Free reschedule up to 72 hrs before.',
  ],
};

function normalizeWhatHappensForm(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const items = Array.isArray(src.items)
    ? src.items.map((item) => (typeof item === 'string' ? item : '')).slice(0, 20)
    : [];
  return {
    heading:
      typeof src.heading === 'string' && src.heading.trim()
        ? src.heading
        : DEFAULT_WHAT_HAPPENS_NEXT.heading,
    listStyle: src.listStyle === 'bullets' ? 'bullets' : 'numbered',
    items: items.length > 0 ? items : [...DEFAULT_WHAT_HAPPENS_NEXT.items],
  };
}

export default function PackageModal({ isOpen, onClose, onSave, editPackage }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'service',
    durationMinutes: 30,
    durationDisplayUnit: 'minutes',
    durationInput: 30,
    price: 0,
    includedMics: 0,
    subtitle: '',
    maxGuests: 5,
    description: '',
    detailPage: '',
    detailPageHtml: '',
    detailPageCss: '',
    features: [''],
    whatHappensNext: { ...DEFAULT_WHAT_HAPPENS_NEXT, items: [...DEFAULT_WHAT_HAPPENS_NEXT.items] },
    extras: [],
    image: '',
    isActive: true,
    highlightBadgeEnabled: false,
    highlightBadgeText: 'Most Popular',
    highlightBadgeUrl: '',
    bundleBenefits: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingExtraIndex, setUploadingExtraIndex] = useState(null);
  const [extraImagePreviews, setExtraImagePreviews] = useState({});
  const [saving, setSaving] = useState(false);
  /** null | 'package' | number (extra index) */
  const [mediaPickerTarget, setMediaPickerTarget] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editPackage) {
      const image = editPackage.image || '';
      const durationMinutes = editPackage.durationMinutes || 30;
      const durationDisplayUnit = normalizeDurationUnit(editPackage.durationDisplayUnit);
      setFormData({
        name: editPackage.name || '',
        type: editPackage.type || 'service',
        durationMinutes,
        durationDisplayUnit,
        durationInput: minutesToDisplayValue(durationMinutes, durationDisplayUnit),
        price: editPackage.price || 0,
        includedMics: Number(editPackage.includedMics) || 0,
        subtitle: editPackage.subtitle || '',
        maxGuests: Math.min(9, Math.max(1, Number(editPackage.maxGuests) || 5)),
        description: editPackage.description || '',
        detailPage: editPackage.detailPage || '',
        detailPageHtml: editPackage.detailPageHtml || '',
        detailPageCss: editPackage.detailPageCss || '',
        features:
          Array.isArray(editPackage.features) && editPackage.features.length > 0
            ? editPackage.features
            : [''],
        whatHappensNext: normalizeWhatHappensForm(editPackage.whatHappensNext),
        extras: Array.isArray(editPackage.extras)
          ? editPackage.extras.map((extra) => ({
              image: extra.image || '',
              title: extra.title || '',
              price: extra.price ?? 0,
              description: extra.description || '',
              quantityEnabled: Boolean(extra.quantityEnabled),
            }))
          : [],
        image,
        isActive: editPackage.isActive !== false,
        highlightBadgeEnabled: Boolean(editPackage.highlightBadgeEnabled),
        highlightBadgeText: editPackage.highlightBadgeText || 'Most Popular',
        highlightBadgeUrl: editPackage.highlightBadgeUrl || '',
        bundleBenefits: editPackage.bundleBenefits || '',
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
        durationDisplayUnit: 'minutes',
        durationInput: 30,
        price: 0,
        includedMics: 0,
        subtitle: '',
        maxGuests: 5,
        description: '',
        detailPage: '',
        detailPageHtml: '',
        detailPageCss: '',
        features: [''],
        whatHappensNext: {
          ...DEFAULT_WHAT_HAPPENS_NEXT,
          items: [...DEFAULT_WHAT_HAPPENS_NEXT.items],
        },
        extras: [],
        image: '',
        isActive: true,
        highlightBadgeEnabled: false,
        highlightBadgeText: 'Most Popular',
        highlightBadgeUrl: '',
        bundleBenefits: '',
      });
      setImagePreview('');
      setExtraImagePreviews({});
    }
    setMediaPickerTarget(null);
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

  const setWhatHappensNext = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      whatHappensNext: { ...prev.whatHappensNext, [field]: value },
    }));
  };

  const setWhatHappensItem = (index, value) => {
    setFormData((prev) => {
      const items = [...(prev.whatHappensNext?.items || [])];
      items[index] = value;
      return {
        ...prev,
        whatHappensNext: { ...prev.whatHappensNext, items },
      };
    });
  };

  const addWhatHappensItem = () => {
    setFormData((prev) => {
      const items = [...(prev.whatHappensNext?.items || [])];
      if (items.length >= 20) return prev;
      return {
        ...prev,
        whatHappensNext: {
          ...prev.whatHappensNext,
          items: [...items, ''],
        },
      };
    });
  };

  const removeWhatHappensItem = (index) => {
    setFormData((prev) => {
      const items = (prev.whatHappensNext?.items || []).filter((_, i) => i !== index);
      return {
        ...prev,
        whatHappensNext: {
          ...prev.whatHappensNext,
          items: items.length > 0 ? items : [''],
        },
      };
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

  const handleMediaLibrarySelect = (imageUrl) => {
    if (mediaPickerTarget === null) return;

    if (mediaPickerTarget === 'package') {
      handleChange('image', imageUrl);
      setImagePreview(resolveImagePreview(imageUrl));
    } else if (typeof mediaPickerTarget === 'number') {
      const index = mediaPickerTarget;
      handleExtraChange(index, 'image', imageUrl);
      setExtraImagePreviews((prev) => ({
        ...prev,
        [index]: resolveImagePreview(imageUrl),
      }));
    }

    setMediaPickerTarget(null);
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

  const handleDurationInputChange = (raw) => {
    const next = raw === '' ? '' : Number(raw);
    setFormData((prev) => {
      const durationMinutes =
        next === '' ? prev.durationMinutes : displayValueToMinutes(next, prev.durationDisplayUnit);
      return {
        ...prev,
        durationInput: next === '' ? '' : next,
        durationMinutes: durationMinutes > 0 ? durationMinutes : prev.durationMinutes,
      };
    });
  };

  const handleDurationUnitChange = (nextUnit) => {
    setFormData((prev) => {
      const unit = normalizeDurationUnit(nextUnit);
      const minutes =
        prev.durationInput === ''
          ? prev.durationMinutes
          : displayValueToMinutes(prev.durationInput, prev.durationDisplayUnit);
      return {
        ...prev,
        durationDisplayUnit: unit,
        durationMinutes: minutes > 0 ? minutes : prev.durationMinutes,
        durationInput: minutesToDisplayValue(minutes > 0 ? minutes : prev.durationMinutes, unit),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (uploadingImage || uploadingExtraIndex !== null) return;

    const durationMinutes = displayValueToMinutes(
      formData.durationInput === '' ? formData.durationMinutes : formData.durationInput,
      formData.durationDisplayUnit
    );
    if (!durationMinutes || durationMinutes < 1) return;

    setSaving(true);
    const { durationInput, ...rest } = formData;
    const payload = {
      ...rest,
      durationMinutes,
      durationDisplayUnit: normalizeDurationUnit(formData.durationDisplayUnit),
      includedMics: Math.max(0, Number(formData.includedMics) || 0),
      subtitle: formData.subtitle?.trim() || '',
      maxGuests: Math.min(9, Math.max(1, Number(formData.maxGuests) || 5)),
      highlightBadgeText: formData.highlightBadgeText?.trim() || 'Most Popular',
      highlightBadgeUrl: formData.highlightBadgeUrl?.trim() || '',
      bundleBenefits: formData.bundleBenefits?.trim() || '',
      features: formData.features
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
      whatHappensNext: {
        heading: formData.whatHappensNext?.heading?.trim() || DEFAULT_WHAT_HAPPENS_NEXT.heading,
        listStyle:
          formData.whatHappensNext?.listStyle === 'bullets' ? 'bullets' : 'numbered',
        items: (formData.whatHappensNext?.items || [])
          .map((item) => String(item || '').trim())
          .filter((item) => item.length > 0)
          .slice(0, 20),
      },
      extras: formData.extras
        .map((extra) => ({
          image: extra.image || '',
          title: extra.title.trim(),
          price: Number(extra.price) || 0,
          description: extra.description.trim(),
          quantityEnabled: Boolean(extra.quantityEnabled),
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
                  Duration *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={formData.durationDisplayUnit === 'hours' ? 0.25 : 1}
                    step={formData.durationDisplayUnit === 'hours' ? 0.25 : 1}
                    value={formData.durationInput}
                    onChange={(e) => handleDurationInputChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    required
                  />
                  <UnitToggle
                    value={formData.durationDisplayUnit}
                    onChange={handleDurationUnitChange}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Shown as {formData.durationDisplayUnit === 'hours' ? 'hours' : 'minutes'} on
                  admin and storefront.
                </p>
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
                Included microphones
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={formData.includedMics}
                onChange={(e) =>
                  handleChange(
                    'includedMics',
                    e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) || 0)
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="e.g. 2"
              />
              <p className="mt-1 text-xs text-gray-500">
                How many mics this package includes. Used when guests need extra mics.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sub title
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                placeholder="e.g. 2 mics included, up to 5"
              />
              <p className="mt-1 text-xs text-gray-500">
                Shown under the price on booking package cards.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. of guests
              </label>
              <select
                value={formData.maxGuests}
                onChange={(e) =>
                  handleChange('maxGuests', Math.min(9, Math.max(1, Number(e.target.value) || 5)))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Guest number options shown on the booking flow for this package (1–9).
              </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bundle Benefits
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Optional text shown below feature bullets. Title &quot;BUNDLE BENEFITS&quot; is fixed.
              </p>
              <input
                type="text"
                value={formData.bundleBenefits}
                onChange={(e) => handleChange('bundleBenefits', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                placeholder="e.g., 25% off studio add-ons · 15% off editing"
              />
            </div>

            <div>
              <ImageUploader
                label="Package Image"
                helperText="Upload from PC or select from Media Library (max 5MB for local upload)."
                value={imagePreview}
                onChange={handleImageChange}
                onSelectFromLibrary={() => setMediaPickerTarget('package')}
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

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800">What happens next</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Shown in the booking flow sidebar for this package.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  value={formData.whatHappensNext?.heading || ''}
                  onChange={(e) => setWhatHappensNext('heading', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white"
                  placeholder="What happens next"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  List style
                </label>
                <div className="inline-flex rounded-lg bg-white border border-gray-200 p-1" role="group">
                  <button
                    type="button"
                    onClick={() => setWhatHappensNext('listStyle', 'numbered')}
                    className={`min-w-[7rem] rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      formData.whatHappensNext?.listStyle !== 'bullets'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Number list
                  </button>
                  <button
                    type="button"
                    onClick={() => setWhatHappensNext('listStyle', 'bullets')}
                    className={`min-w-[7rem] rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                      formData.whatHappensNext?.listStyle === 'bullets'
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bullet list
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Steps</label>
                  <button
                    type="button"
                    onClick={addWhatHappensItem}
                    className="text-sm text-primary hover:text-secondary font-medium"
                  >
                    + Add step
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.whatHappensNext?.items || []).map((item, index) => (
                    <div key={`pkg-what-next-${index}`} className="flex items-start gap-2">
                      <span className="mt-2 w-7 shrink-0 text-xs font-mono text-gray-400 text-right">
                        {formData.whatHappensNext?.listStyle === 'bullets'
                          ? '•'
                          : String(index + 1).padStart(2, '0')}
                      </span>
                      <textarea
                        rows={2}
                        value={item}
                        onChange={(e) => setWhatHappensItem(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary bg-white"
                        placeholder={`Step ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeWhatHappensItem(index)}
                        className="mt-1 p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
                        title="Remove step"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
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
                        helperText="Optional. Upload from PC or select from Media Library (max 5MB for local upload)."
                        value={extraImagePreviews[index] || (extra.image ? resolveImagePreview(extra.image) : '')}
                        onChange={(file) => handleExtraImageChange(index, file)}
                        onSelectFromLibrary={() => setMediaPickerTarget(index)}
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
                          Price (£ / hour)
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

                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(extra.quantityEnabled)}
                          onChange={(e) =>
                            handleExtraChange(index, 'quantityEnabled', e.target.checked)
                          }
                          className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span>
                          <span className="block text-sm font-medium text-gray-800">
                            Enable quantity (+ / −)
                          </span>
                          <span className="block text-xs text-gray-500">
                            Show increment/decrement on the booking page. Price is charged per
                            quantity × hourly rate × booked hours.
                          </span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HTML/CSS Widget Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detail Page - HTML/CSS Widget
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Custom HTML and CSS content shown on the package detail page. The sidebar card details remain unaffected.
                </p>
              </div>

              {/* HTML Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-orange-100 text-[10px] font-bold text-orange-600">
                    HTML
                  </span>
                  HTML Content
                </label>
                <textarea
                  value={formData.detailPageHtml}
                  onChange={(e) => handleChange('detailPageHtml', e.target.value)}
                  rows={10}
                  className="w-full font-mono text-sm border border-gray-300 rounded-md shadow-sm p-3"
                  placeholder={`<div class="my-widget">\n  <h2>Welcome</h2>\n  <p>Your custom content here...</p>\n</div>`}
                  spellCheck={false}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Write your HTML structure. Use class names for styling.
                </p>
              </div>

              {/* CSS Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[10px] font-bold text-blue-600">
                    CSS
                  </span>
                  CSS Styles
                </label>
                <textarea
                  value={formData.detailPageCss}
                  onChange={(e) => handleChange('detailPageCss', e.target.value)}
                  rows={8}
                  className="w-full font-mono text-sm border border-gray-300 rounded-md shadow-sm p-3 "
                  placeholder={`.my-widget {\n  padding: 20px;\n  background: #f5f5f5;\n}\n\n.my-widget h2 {\n  color: #333;\n  margin-bottom: 10px;\n}`}
                  spellCheck={false}
                />
                <p className="mt-1 text-xs text-gray-500">
                  CSS styles are scoped to the widget container and won't affect other page elements.
                </p>
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

      <MediaLibraryPicker
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={handleMediaLibrarySelect}
      />
    </div>
  );
}
