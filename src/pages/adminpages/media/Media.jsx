import React, { useState, useEffect } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import { Helmet } from "react-helmet-async";
import { toast } from "react-toastify";

// Import service
import { getFiles, updateFile, uploadFile, deleteFile } from "./service";

// Import components
import {
  SearchBar,
  DirectoryTabs,
  MediaGrid,
  Pagination,
  UploadImageModal,
  ConfirmTitleUpdateModal,
} from "./components/media";

export default function Media() {
  const [selectedPage, setSelectedPage] = useState("media");
  const [directories, setDirectories] = useState([]); // State to store the directories with files
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

  const fetchFiles = async () => {
    try {
      const result = await getFiles(auth.ip);

      if (result.success) {
        // Filter out the 'images' and 'feed' directories
        const filteredDirectories = result.contents.filter(
          (directory) =>
            directory.name !== "images" && directory.name !== "feed"
        );

        setDirectories(filteredDirectories); // Update the state with filtered directories
        if (!selectedTab) {
          setSelectedTab(filteredDirectories[0]?.name || null); // Set default tab to the first available directory
        }
        setLoading(false); // Set loading to false when the data is fetched
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
  }, [auth.ip]);

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
    const selectedDirectory = directories.find(
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

  // Get total number of pages
  const getTotalPages = () => {
    const selectedDirectory = directories.find(
      (dir) => dir.name === selectedTab
    );

    if (!selectedDirectory) return 1;

    const filteredImages = selectedDirectory.contents.filter((file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return Math.ceil(filteredImages.length / itemsPerPage);
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
    return `${directoryName}-${file.path || file._id || file.name}`;
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

      // API call to update title
      const result = await updateFile(auth.ip, updateData);

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

      // API call to update alt text
      const result = await updateFile(auth.ip, updateData);

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

  // Handle uploading images
  const handleUploadImages = async (files, altText) => {
    if (!selectedTab) {
      toast.error("Please select a directory tab first");
      return;
    }

    setIsUploading(true);
    try {
      // Title is automatically generated from filename (filename = title)
      // Filenames are already sanitized (spaces replaced with hyphens) in UploadImageModal
      const result = await uploadFile(auth.ip, selectedTab, files, altText);

      if (result.success) {
        toast.success(`Successfully uploaded ${files.length} image(s)!`);
        setIsUploadModalOpen(false);
        // Refresh the file list
        await fetchFiles();
      } else {
        toast.error(result.error || "Failed to upload images");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
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
      const result = await updateFile(auth.ip, updateData);

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
              <div>Loading media...</div>
            ) : (
              <div className="space-y-10">
                {/* Search Bar */}
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />

                {/* Navigation Tabs */}
                <DirectoryTabs
                  directories={directories}
                  selectedTab={selectedTab}
                  onTabChange={handleTabChange}
                />

                {/* Display the contents of the selected tab */}
                {directories.map((directory, index) =>
                  directory.name === selectedTab ? (
                    <div key={index}>
                      {/* Section Title and Upload Button */}
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold capitalize">
                          {directory.name}
                        </h2>
                        <button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
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
                          Upload Images
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

                      {/* Pagination Controls */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={getTotalPages()}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                      />
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Upload Image Modal */}
            {selectedTab && (
              <UploadImageModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                directoryName={selectedTab}
                onUpload={handleUploadImages}
                isUploading={isUploading}
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
