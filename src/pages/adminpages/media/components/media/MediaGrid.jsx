import PropTypes from 'prop-types';
import MediaCard from './MediaCard';

const MediaGrid = ({
  files,
  directoryName,
  auth,
  readOnlyMetadata = false,
  editingFileId,
  editingTitleId,
  editingAltTextId,
  editedFileName,
  fileExtension,
  editedTitle,
  editedAltText,
  isUpdating,
  onStartEdit,
  onCancelEdit,
  onSaveFileName,
  onStartEditTitle,
  onCancelEditTitle,
  onSaveTitle,
  onStartEditAltText,
  onCancelEditAltText,
  onSaveAltText,
  onCopyUrl,
  onFileNameChange,
  onTitleChange,
  onAltTextChange,
  onDelete,
  getImagePathAfterUploads,
  getFileUniqueId
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => {
        const imageUrl =
          file.url &&
          (file.url.startsWith("http://") || file.url.startsWith("https://"))
            ? file.url
            : getImagePathAfterUploads(file.path)
              ? `${auth.ip}uploads/${getImagePathAfterUploads(file.path)}`
              : `${auth.ip}uploads/default-placeholder.png`;

        const uniqueFileId = getFileUniqueId(file, directoryName);

        return (
          <MediaCard
            key={uniqueFileId}
            file={file}
            directoryName={directoryName}
            readOnlyMetadata={readOnlyMetadata}
            imageUrl={imageUrl}
            uniqueFileId={uniqueFileId}
            editingFileId={editingFileId}
            editingTitleId={editingTitleId}
            editingAltTextId={editingAltTextId}
            editedFileName={editedFileName}
            fileExtension={fileExtension}
            editedTitle={editedTitle}
            editedAltText={editedAltText}
            isUpdating={isUpdating}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            onSaveFileName={onSaveFileName}
            onStartEditTitle={onStartEditTitle}
            onCancelEditTitle={onCancelEditTitle}
            onSaveTitle={onSaveTitle}
            onStartEditAltText={onStartEditAltText}
            onCancelEditAltText={onCancelEditAltText}
            onSaveAltText={onSaveAltText}
            onCopyUrl={onCopyUrl}
            onFileNameChange={onFileNameChange}
            onTitleChange={onTitleChange}
            onAltTextChange={onAltTextChange}
            onDelete={onDelete}
            getImagePathAfterUploads={getImagePathAfterUploads}
          />
        );
      })}
    </div>
  );
};

MediaGrid.propTypes = {
  files: PropTypes.array.isRequired,
  directoryName: PropTypes.string.isRequired,
  auth: PropTypes.object.isRequired,
  readOnlyMetadata: PropTypes.bool,
  editingFileId: PropTypes.string,
  editingTitleId: PropTypes.string,
  editingAltTextId: PropTypes.string,
  editedFileName: PropTypes.string.isRequired,
  fileExtension: PropTypes.string.isRequired,
  editedTitle: PropTypes.string.isRequired,
  editedAltText: PropTypes.string.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveFileName: PropTypes.func.isRequired,
  onStartEditTitle: PropTypes.func.isRequired,
  onCancelEditTitle: PropTypes.func.isRequired,
  onSaveTitle: PropTypes.func.isRequired,
  onStartEditAltText: PropTypes.func.isRequired,
  onCancelEditAltText: PropTypes.func.isRequired,
  onSaveAltText: PropTypes.func.isRequired,
  onCopyUrl: PropTypes.func.isRequired,
  onFileNameChange: PropTypes.func.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  onAltTextChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  getImagePathAfterUploads: PropTypes.func.isRequired,
  getFileUniqueId: PropTypes.func.isRequired
};

export default MediaGrid;

