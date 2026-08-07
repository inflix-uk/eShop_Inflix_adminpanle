import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiImage, FiFilm } from 'react-icons/fi';
import { useAuth } from '../../../../../context/Auth';
import { getSpacesFiles } from '../../service/mediaService';
import {
  filterDirectoriesByMediaType,
  getDirectoryDisplayName,
  isVideoFileName,
} from '../../utils/mediaUtils';

function resolveMediaUrl(file, backendUrl) {
  if (file?.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
    return file.url;
  }
  if (file?.path) {
    if (file.path.includes('uploads/')) {
      const after = file.path.split('uploads/')[1];
      return after ? `${backendUrl}uploads/${after}` : null;
    }
    if (file.path.startsWith('/')) {
      return `${backendUrl}${file.path.replace(/^\//, '')}`;
    }
    return `${backendUrl}uploads/${file.path}`;
  }
  return null;
}

/**
 * Modal to browse Media Library (Spaces) and select an image or video URL.
 * @param {'images'|'videos'|'all'} mediaType
 */
const MediaLibraryPicker = ({
  isOpen,
  onClose,
  onSelect,
  mediaType = 'images',
}) => {
  const auth = useAuth();
  const [allDirectories, setAllDirectories] = useState([]);
  const [selectedTab, setSelectedTab] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [spacesConfigured, setSpacesConfigured] = useState(true);
  const [activeType, setActiveType] = useState(
    mediaType === 'all' ? 'images' : mediaType
  );

  useEffect(() => {
    if (!isOpen) return;
    setActiveType(mediaType === 'all' ? 'images' : mediaType);
  }, [isOpen, mediaType]);

  const directories = useMemo(() => {
    if (mediaType === 'all') {
      return filterDirectoriesByMediaType(allDirectories, activeType);
    }
    return filterDirectoriesByMediaType(allDirectories, mediaType);
  }, [allDirectories, mediaType, activeType]);

  useEffect(() => {
    if (!isOpen || !auth?.ip) return;

    let cancelled = false;

    const fetchFiles = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await getSpacesFiles(auth.ip);
        if (cancelled) return;

        setSpacesConfigured(Boolean(result.spacesConfigured));

        if (!result.success) {
          setAllDirectories([]);
          setError(result.error || 'Failed to load media library');
          return;
        }

        const filtered = (result.contents || []).filter(
          (directory) =>
            directory.name !== 'images' &&
            directory.name !== 'feed' &&
            !String(directory.name).startsWith('images/') &&
            !String(directory.name).startsWith('feed/')
        );
        setAllDirectories(filtered);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load media library');
          setAllDirectories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFiles();
    return () => {
      cancelled = true;
    };
  }, [isOpen, auth?.ip]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!directories.length) {
      setSelectedTab(null);
      return;
    }
    const stillValid = directories.some((d) => d.name === selectedTab);
    if (!stillValid) {
      setSelectedTab(directories[0].name);
    }
  }, [directories, selectedTab]);

  const filteredFiles = useMemo(() => {
    const selectedDirectory = directories.find((dir) => dir.name === selectedTab);
    if (!selectedDirectory?.contents) return [];

    const term = searchTerm.trim().toLowerCase();
    return selectedDirectory.contents.filter((file) => {
      if (!term) return true;
      const name = (file.name || '').toLowerCase();
      const title = (file.title || '').toLowerCase();
      return name.includes(term) || title.includes(term);
    });
  }, [directories, selectedTab, searchTerm]);

  const handleSelect = (file) => {
    const url = resolveMediaUrl(file, auth.ip);
    if (!url) return;
    onSelect(url, file);
    onClose();
  };

  const showingVideos =
    mediaType === 'videos' ||
    (mediaType === 'all' && activeType === 'videos');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Media Library</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {showingVideos
                  ? 'Select an existing video, or close and upload from Media → Videos.'
                  : 'Select an existing image, or close and upload from your PC.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Close media library"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="px-5 pt-4 pb-2 space-y-3 border-b border-gray-100">
            {mediaType === 'all' && (
              <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveType('images')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    activeType === 'images'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Images
                </button>
                <button
                  type="button"
                  onClick={() => setActiveType('videos')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                    activeType === 'videos'
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  Videos
                </button>
              </div>
            )}

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                showingVideos
                  ? 'Search videos by name...'
                  : 'Search images by name...'
              }
              className="block w-full rounded-md border-gray-300 text-sm focus:border-primary focus:ring-primary"
            />

            {directories.length > 0 && (
              <div className="flex gap-1 overflow-x-auto pb-1">
                {directories.map((directory) => (
                  <button
                    key={directory.name}
                    type="button"
                    onClick={() => setSelectedTab(directory.name)}
                    className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                      selectedTab === directory.name
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={directory.name}
                  >
                    {getDirectoryDisplayName(directory.name)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm text-gray-500">
                Loading media library...
              </div>
            ) : error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : !spacesConfigured ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Media storage (Spaces) is not configured.
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                {showingVideos ? (
                  <FiFilm className="h-10 w-10 mb-2 text-gray-300" />
                ) : (
                  <FiImage className="h-10 w-10 mb-2 text-gray-300" />
                )}
                <p className="text-sm">
                  {showingVideos
                    ? 'No videos found in this folder.'
                    : 'No images found in this folder.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredFiles.map((file) => {
                  const mediaUrl = resolveMediaUrl(file, auth.ip);
                  const key = file.spacesKey || file.path || file._id || file.name;
                  const isVideo = isVideoFileName(file.name || file.path || '');
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelect(file)}
                      className="group text-left rounded-lg border border-gray-200 overflow-hidden hover:border-primary hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                      title={file.title || file.name}
                    >
                      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                        {mediaUrl ? (
                          isVideo ? (
                            <video
                              src={mediaUrl}
                              className="h-full w-full object-contain bg-black"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={file.altText || file.title || file.name || 'Media'}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          )
                        ) : isVideo ? (
                          <FiFilm className="h-8 w-8 text-gray-300" />
                        ) : (
                          <FiImage className="h-8 w-8 text-gray-300" />
                        )}
                      </div>
                      <div className="px-2 py-1.5 border-t border-gray-100">
                        <p className="text-xs text-gray-700 truncate group-hover:text-primary">
                          {file.title || file.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 px-5 py-3 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

MediaLibraryPicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  mediaType: PropTypes.oneOf(['images', 'videos', 'all']),
};

MediaLibraryPicker.defaultProps = {
  mediaType: 'images',
};

export default MediaLibraryPicker;
