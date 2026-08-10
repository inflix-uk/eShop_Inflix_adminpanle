import React, { useState, useEffect, useMemo } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

// Import service
import {
  getFiles,
  getSpacesFiles,
  updateFile,
  updateFileSpaces,
  uploadFile,
  uploadFileSpaces,
  deleteFile,
  deleteSpacesFile,
} from "./service";

// Import components
import {
  SearchBar,
  DirectoryTabs,
  MediaGrid,
  Pagination,
  UploadImageModal,
  ConfirmTitleUpdateModal,
} from "./components/media";
import { CardGridSkeleton } from "../shared/Skeletons";
import {
  filterDirectoriesByMediaType,
  getDirectoryDisplayName,
} from "./utils/mediaUtils";

export default function Media() {
  const [selectedPage, setSelectedPage] = useState("media");
  /** S3 / DO Spaces only (Vercel Blob UI removed). */
  const storageModule = "spaces";
  const [spacesConfigured, setSpacesConfigured] = useState(true);
  const [directories, setDirectories] = useState([]); // State to store the directories with files
  const [mediaType, setMediaType] = useState("images"); // images | videos
  const [loading, setLoading] = useState(true); // State for loading
  const [selectedTab, setSelectedTab] = useState(null); // State for currently selected tab
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [itemsPerPage, setItemsPerPage] = useState(12); // Set the default number of images per page
  const [editingFileId, setEditingFileId] = useState(null); // Track which file is being edited
  const [editedFileName, setEditedFileName] = useState(""); // Store edited filename (without extension)
  const [fileExtension, setFileExtension] = useState(""); // Store file extension
  const [editingTitleId, setEditingTitleId] = useState(null); // Track which file title is being edited
  const [editedTitle, setEditedTitle] = useState(""); // Store edited title
  const [editingAltTextId, setEditingAltTextId] = useState(null); // Track which file alt text is being edited
  const [editedAltText, setEditedAltText] = useState(""); // Store edited alt text
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false); // Upload modal state
  const [isUploading, setIsUploading] = useState(false); // Upload loading state
  const [isConfirmTitleModalOpen, setIsConfirmTitleModalOpen] = useState(false); // Title update confirmation modal
  const [pendingTitleUpdate, setPendingTitleUpdate] = useState(null); // Store pending title update data
  const auth = useAuth();

  const visibleDirectories = useMemo(
    () => filterDirectoriesByMediaType(directories, mediaType),
    [directories, mediaType]
  );

  const videoFolderNames = useMemo(
    () =>
      filterDirectoriesByMediaType(directories, "videos").map((d) => d.name),
    [directories]
  );

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const result =
        storageModule === "spaces"
          ? await getSpacesFiles(auth.ip)
          : await getFiles(auth.ip);

      if (storageModule === "spaces") {
        setSpacesConfigured(Boolean(result.spacesConfigured));
      } else {
        setSpacesConfigured(true);
      }

      if (result.success) {
        const filteredDirectories = (result.contents || []).filter(
          (directory) =>
            directory.name !== "images" &&
            directory.name !== "feed" &&
            !String(directory.name).startsWith("images/") &&
            !String(directory.name).startsWith("feed/")
        );

        setDirectories(filteredDirectories);
        setLoading(false);
      } else {
        console.error("Error fetching files:", result.error);
        toast.error(result.error || "Failed to fetch files");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.ip]);

  // Keep selected tab within the active Images / Videos section
  useEffect(() => {
    if (!visibleDirectories.length) {
      setSelectedTab(null);
      return;
    }
    const stillValid = visibleDirectories.some((d) => d.name === selectedTab);
    if (!stillValid) {
      setSelectedTab(visibleDirectories[0].name);
      setCurrentPage(1);
    }
  }, [visibleDirectories, selectedTab]);

  const handleMediaTypeChange = (type) => {
    if (type === mediaType) return;
    setMediaType(type);
    setSearchTerm("");
    setCurrentPage(1);
    const next = filterDirectoriesByMediaType(directories, type);
    setSelectedTab(next[0]?.name || null);
  };
  const getImagePathAfterUploads = (filePath) => {
    // Check if filePath exists and contains 'uploads/'
    if (filePath && filePath.includes("uploads/")) {
      const splitPath = filePath.split("uploads/");
      return splitPath.length > 1 ? splitPath[1] : null;
    }
    return null; // Return null if path doesn't contain 'uploads/' or is invalid
  };

  const handleTabChange = (tabName) => {
    setSelectedTab(tabName);
    setCurrentPage(1); // Reset to the first page when changing tabs
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when performing a new search
  };

  // Pagination logic
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= getTotalPages()) {
      setCurrentPage(newPage);
    }
  };

  // Handler for changing the items per page
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to the first page when items per page changes
  };

  // Get filtered and paginated images
  const getFilteredImages = () => {
    const selectedDirectory = visibleDirectories.find(
      (dir) => dir.name === selectedTab
    );

    if (!selectedDirectory) return [];

    // Filter images based on the search term
    const filteredImages = selectedDirectory.contents.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Paginate the filtered images
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedImages = filteredImages.slice(
      startIndex,
      startIndex + itemsPerPage
    );

    return paginatedImages;
  };

  // Calculate total pages based on the filtered images
  const getTotalPages = () => {
    const selectedDirectory = visibleDirectories.find(
      (dir) => dir.name === selectedTab
    );
    if (!selectedDirectory) return 1;

    const filteredImages = selectedDirectory.contents.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return Math.ceil(filteredImages.length / itemsPerPage) || 1;
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Handle copying image URL to clipboard
  const handleCopyUrl = async (imageUrl) => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Image URL copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL");
    }
  };

  // Extract file extension from filename
  const getFileExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) return "";
    return filename.substring(lastDotIndex);
  };

  // Get filename without extension
  const getFileNameWithoutExtension = (filename) => {
    const lastDotIndex = filename.lastIndexOf(".");
    if (lastDotIndex === -1) return filename;
    return filename.substring(0, lastDotIndex);
  };

  // Create unique identifier for a file
  const getFileUniqueId = (file, directoryName) => {
    return `${directoryName}-${file.spacesKey || file.path || file._id || file.name}`;
  };

  // Helper function to sanitize filename (replace spaces with hyphens)
  const sanitizeFileName = (fileName) => {
    // Get filename without extension
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return fileName.replace(/\s+/g, "-");
    }
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    // Replace spaces with hyphens in filename (not extension)
    return nameWithoutExt.replace(/\s+/g, "-") + extension;
  };

  // Handle starting edit mode
  const handleStartEdit = (file, directoryName) => {
    setEditingFileId(getFileUniqueId(file, directoryName));
    const extension = getFileExtension(file.name);
    const nameWithoutExt = getFileNameWithoutExtension(file.name);
    setFileExtension(extension);
    setEditedFileName(nameWithoutExt);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingFileId(null);
    setEditedFileName("");
    setFileExtension("");
  };

  // Handle starting title edit mode
  const handleStartEditTitle = (file, directoryName) => {
    setEditingTitleId(getFileUniqueId(file, directoryName));
    // Title should be filename without extension (if title is not set, use filename)
    const titleToEdit = file.title || getFileNameWithoutExtension(file.name);
    setEditedTitle(titleToEdit);
    // Set file extension for title editing (to show as fixed part)
    const extension = getFileExtension(file.name);
    setFileExtension(extension);
  };

  // Handle canceling title edit
  const handleCancelEditTitle = () => {
    setEditingTitleId(null);
    setEditedTitle("");
  };

  // Handle starting alt text edit mode
  const handleStartEditAltText = (file, directoryName) => {
    setEditingAltTextId(getFileUniqueId(file, directoryName));
    setEditedAltText(file.altText || "");
  };

  // Handle canceling alt text edit
  const handleCancelEditAltText = () => {
    setEditingAltTextId(null);
    setEditedAltText("");
  };

  // Handle saving title update (with confirmation)
  const handleSaveTitle = async (file, directoryName) => {
    if (!editedTitle.trim()) {
      toast.error("Title is required for URL generation");
      return;
    }

    // Sanitize title: replace spaces with hyphens (title = filename, so no spaces allowed)
    const sanitizedTitle = sanitizeFileName(editedTitle.trim());

    // Get current title (filename without extension)
    const currentTitle = file.title || getFileNameWithoutExtension(file.name);

    // Check if title is actually changing
    if (sanitizedTitle === currentTitle) {
      // No change, just cancel edit
      handleCancelEditTitle();
      return;
    }

    // Show confirmation modal before updating
    setPendingTitleUpdate({
      file,
      directoryName,
      sanitizedTitle,
      currentTitle,
    });
    setIsConfirmTitleModalOpen(true);
  };

  // Handle confirmed title update
  const handleConfirmTitleUpdate = async () => {
    if (!pendingTitleUpdate) return;

    const { file, directoryName, sanitizedTitle } = pendingTitleUpdate;

    setIsConfirmTitleModalOpen(false);
    setIsUpdating(true);

    try {
      // Construct the file path
      const filePath = getImagePathAfterUploads(file.path);

      // Prepare update data
      // When title is updated, filename should also be updated to match (title = filename)
      const newFileName = sanitizedTitle + getFileExtension(file.name);

      const updateData = {
        directory: directoryName,
        oldFileName: file.name,
        newFileName: newFileName, // Update filename to match title
        filePath: filePath || file.path,
        title: sanitizedTitle, // Title is the sanitized version
      };

      const result =
        storageModule === "spaces" && file.spacesKey
          ? await updateFileSpaces(auth.ip, {
              key: file.spacesKey,
              directory: directoryName,
              oldFileName: file.name,
              newFileName,
              title: sanitizedTitle,
            })
          : await updateFile(auth.ip, updateData);

      if (result.success) {
        toast.success("Title updated successfully!");

        // Clear editing state first
        handleCancelEditTitle();

        // Refresh the file list to get updated data from backend
        await fetchFiles();
      } else {
        toast.error(result.error || "Failed to update title");
      }
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title. Please try again.");
    } finally {
      setIsUpdating(false);
      setPendingTitleUpdate(null);
    }
  };

  // Handle canceling title update confirmation
  const handleCancelTitleUpdate = () => {
    setIsConfirmTitleModalOpen(false);
    setPendingTitleUpdate(null);
    // Keep the edit mode open so user can modify or cancel
  };

  // Handle saving alt text update
  const handleSaveAltText = async (file, directoryName) => {
    setIsUpdating(true);
    try {
      // Construct the file path
      const filePath = getImagePathAfterUploads(file.path);

      // Prepare update data
      const updateData = {
        directory: directoryName,
        oldFileName: file.name,
        newFileName: file.name, // Keep same filename
        filePath: filePath || file.path,
        altText: editedAltText.trim(),
      };

      const result =
        storageModule === "spaces" && file.spacesKey
          ? await updateFileSpaces(auth.ip, {
              key: file.spacesKey,
              directory: directoryName,
              oldFileName: file.name,
              newFileName: file.name,
              altText: editedAltText.trim(),
            })
          : await updateFile(auth.ip, updateData);

      if (result.success) {
        toast.success("Alt text updated successfully!");

        // Clear editing state first
        handleCancelEditAltText();

        // Refresh the file list to get updated data from backend
        await fetchFiles();
      } else {
        toast.error(result.error || "Failed to update alt text");
      }
    } catch (error) {
      console.error("Error updating alt text:", error);
      toast.error("Failed to update alt text. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle uploading images / videos
  const handleUploadImages = async (files, altText, uploadDirectory) => {
    const targetDirectory = uploadDirectory || selectedTab;
    if (!targetDirectory) {
      toast.error(
        mediaType === "videos"
          ? "Please choose a video folder"
          : "Please select a directory tab first"
      );
      return;
    }

    setIsUploading(true);
    try {
      const result =
        storageModule === "spaces"
          ? await uploadFileSpaces(auth.ip, targetDirectory, files, altText)
          : await uploadFile(auth.ip, targetDirectory, files, altText);

      if (result.success) {
        toast.success(
          mediaType === "videos"
            ? `Successfully uploaded ${files.length} video(s)!`
            : `Successfully uploaded ${files.length} image(s)!`
        );
        setIsUploadModalOpen(false);
        await fetchFiles();
        if (mediaType === "videos") {
          setSelectedTab(targetDirectory);
        }
      } else {
        toast.error(
          result.error ||
            (mediaType === "videos"
              ? "Failed to upload videos"
              : "Failed to upload images")
        );
      }
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error(
        mediaType === "videos"
          ? "Failed to upload videos. Please try again."
          : "Failed to upload images. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Handle deleting image
  const handleDeleteImage = async (file, directoryName) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete "${file.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsUpdating(true);
    try {
      if (storageModule === "spaces" && file.spacesKey) {
        const result = await deleteSpacesFile(auth.ip, file.spacesKey);
        if (result.success) {
          toast.success("Object deleted from Spaces.");
          await fetchFiles();
        } else {
          toast.error(result.error || "Failed to delete Spaces object");
        }
        return;
      }

      // Construct the file path
      const filePath = getImagePathAfterUploads(file.path);

      const result = await deleteFile(
        auth.ip,
        directoryName,
        file.name,
        filePath || file.path
      );

      if (result.success) {
        toast.success("Image deleted successfully!");
        // Refresh the file list
        await fetchFiles();
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle saving filename update
  const handleSaveFileName = async (file, directoryName) => {
    if (!editedFileName.trim()) {
      toast.error("Filename cannot be empty");
      return;
    }

    // Sanitize filename: replace spaces with hyphens
    const sanitizedName = sanitizeFileName(editedFileName.trim());

    // Combine edited name with original extension
    const newFileName = sanitizedName + fileExtension;

    if (newFileName === file.name) {
      handleCancelEdit();
      return;
    }

    setIsUpdating(true);
    try {
      // Construct the file path
      const filePath = getImagePathAfterUploads(file.path);

      // Prepare update data
      const updateData = {
        directory: directoryName,
        oldFileName: file.name,
        newFileName: newFileName,
        filePath: filePath || file.path,
      };

      // API call to update filename
      const result =
        storageModule === "spaces" && file.spacesKey
          ? await updateFileSpaces(auth.ip, {
              key: file.spacesKey,
              directory: directoryName,
              oldFileName: file.name,
              newFileName,
            })
          : await updateFile(auth.ip, updateData);

      if (result.success) {
        toast.success("Filename updated successfully!");

        // Clear editing state first
        handleCancelEdit();

        // Refresh the file list to get updated paths from backend
        await fetchFiles();
      } else {
        toast.error(result.error || "Failed to update filename");
      }
    } catch (error) {
      console.error("Error updating filename:", error);
      toast.error("Failed to update filename. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Media</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Display loading state */}
            {loading ? (
              <CardGridSkeleton count={12} />
            ) : (
              <div className="space-y-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Media library
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Browse and manage images and videos in S3 / DigitalOcean
                      Spaces.
                    </p>
                  </div>
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-gray-50 self-start">
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange("images")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        mediaType === "images"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Images
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange("videos")}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        mediaType === "videos"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Videos
                    </button>
                  </div>
                </div>

                {storageModule === "spaces" && !spacesConfigured && (
                  <div
                    className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                    role="status"
                  >
                    Spaces is not configured on the server (set{" "}
                    <code className="text-xs">DO_SPACES_*</code> and{" "}
                    <code className="text-xs">MAIN_FOLDER</code>). This tab will
                    stay empty until those env vars are set.
                  </div>
                )}

                {storageModule === "spaces" && spacesConfigured && (
                  <p className="text-sm text-gray-600 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    {mediaType === "videos" ? (
                      <>
                        Videos are stored under{" "}
                        <code className="text-xs">videos/&#123;folder&#125;/</code>
                        . Upload to a folder (homepage, blog, …) and it appears
                        here as its own tab — same idea as banners / logo for
                        images.
                      </>
                    ) : (
                      <>
                        S3 / Spaces: upload, title, and alt text are stored in
                        your bucket and Media library records.
                      </>
                    )}
                  </p>
                )}

                {/* Search Bar */}
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />

                {/* Navigation Tabs */}
                <DirectoryTabs
                  directories={visibleDirectories}
                  selectedTab={selectedTab}
                  onTabChange={handleTabChange}
                />

                {/* Display the contents of the selected tab */}
                {visibleDirectories.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      {mediaType === "videos"
                        ? "No video folders yet. Upload a video to create videos/{folder}."
                        : "No image folders found."}
                    </p>
                    {storageModule === "spaces" && spacesConfigured && (
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {mediaType === "videos"
                          ? "Upload Videos"
                          : "Upload Images"}
                      </button>
                    )}
                  </div>
                ) : (
                  visibleDirectories.map((directory, index) =>
                    directory.name === selectedTab ? (
                      <div key={directory.name || index}>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-2xl font-bold capitalize">
                            {mediaType === "videos"
                              ? `videos / ${getDirectoryDisplayName(directory.name)}`
                              : directory.name}
                          </h2>
                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            disabled={
                              storageModule === "spaces" && !spacesConfigured
                            }
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            {mediaType === "videos"
                              ? "Upload Videos"
                              : "Upload Images"}
                          </button>
                        </div>
                        <MediaGrid
                          files={getFilteredImages()}
                          directoryName={directory.name}
                          auth={auth}
                          editingFileId={editingFileId}
                          editingTitleId={editingTitleId}
                          editingAltTextId={editingAltTextId}
                          editedFileName={editedFileName}
                          fileExtension={fileExtension}
                          editedTitle={editedTitle}
                          editedAltText={editedAltText}
                          isUpdating={isUpdating}
                          onStartEdit={handleStartEdit}
                          onCancelEdit={handleCancelEdit}
                          onSaveFileName={handleSaveFileName}
                          onStartEditTitle={handleStartEditTitle}
                          onCancelEditTitle={handleCancelEditTitle}
                          onSaveTitle={handleSaveTitle}
                          onStartEditAltText={handleStartEditAltText}
                          onCancelEditAltText={handleCancelEditAltText}
                          onSaveAltText={handleSaveAltText}
                          onCopyUrl={handleCopyUrl}
                          onFileNameChange={(e) =>
                            setEditedFileName(e.target.value)
                          }
                          onTitleChange={(e) => setEditedTitle(e.target.value)}
                          onAltTextChange={(e) =>
                            setEditedAltText(e.target.value)
                          }
                          onDelete={handleDeleteImage}
                          getImagePathAfterUploads={getImagePathAfterUploads}
                          getFileUniqueId={getFileUniqueId}
                        />

                        <Pagination
                          currentPage={currentPage}
                          totalPages={getTotalPages()}
                          itemsPerPage={itemsPerPage}
                          onPageChange={handlePageChange}
                          onItemsPerPageChange={handleItemsPerPageChange}
                        />
                      </div>
                    ) : null
                  )
                )}
              </div>
            )}

            {/* Upload modal — images need a tab; videos can create the first folder */}
            {storageModule === "spaces" &&
              spacesConfigured &&
              (mediaType === "videos" || selectedTab) && (
              <UploadImageModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                directoryName={selectedTab || ""}
                onUpload={handleUploadImages}
                isUploading={isUploading}
                mediaType={mediaType}
                existingVideoFolders={videoFolderNames}
              />
            )}
            {/* Confirm Title Update Modal */}
            {pendingTitleUpdate && (
              <ConfirmTitleUpdateModal
                isOpen={isConfirmTitleModalOpen}
                onClose={handleCancelTitleUpdate}
                onConfirm={handleConfirmTitleUpdate}
                oldTitle={pendingTitleUpdate.currentTitle}
                newTitle={pendingTitleUpdate.sanitizedTitle}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
