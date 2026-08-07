/** Aligns with backend Media library: images top-level; videos under videos/{context}/ */

export const VIDEOS_ROOT = 'videos';

export const VIDEO_FOLDER_SUGGESTIONS = [
  'homepage',
  'blog',
  'product',
  'general',
];

export const MEDIA_VIDEO_EXT = /\.(mp4|webm|ogv|ogg|mov)$/i;
export const MEDIA_IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;

export function isVideoFileName(name = '') {
  return MEDIA_VIDEO_EXT.test(String(name));
}

export function isImageFileName(name = '') {
  return MEDIA_IMAGE_EXT.test(String(name));
}

export function isVideoDirectory(name = '') {
  const n = String(name);
  return n === VIDEOS_ROOT || n.startsWith(`${VIDEOS_ROOT}/`);
}

export function sanitizeMediaSubfolder(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/\/+/g, '')
    .slice(0, 64);
}

/** Build Spaces/disk directory for a video upload. */
export function buildVideoUploadDirectory(contextName) {
  const context = sanitizeMediaSubfolder(contextName) || 'general';
  return `${VIDEOS_ROOT}/${context}`;
}

/** Tab label: videos/homepage → homepage */
export function getDirectoryDisplayName(directoryName = '') {
  const n = String(directoryName);
  if (n.startsWith(`${VIDEOS_ROOT}/`)) {
    return n.slice(VIDEOS_ROOT.length + 1) || VIDEOS_ROOT;
  }
  return n;
}

export function filterDirectoriesByMediaType(directories = [], mediaType = 'images') {
  const list = Array.isArray(directories) ? directories : [];
  if (mediaType === 'videos') {
    return list.filter((d) => isVideoDirectory(d.name));
  }
  return list.filter((d) => !isVideoDirectory(d.name));
}

export function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(2)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
