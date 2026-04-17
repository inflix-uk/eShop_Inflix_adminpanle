import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  getAllCategoryCards,
  createCategoryCard,
  updateCategoryCard,
  deleteCategoryCard,
  toggleCategoryCardStatus,
  reorderCategoryCards,
  getCategoryCardsSectionSettings,
  updateCategoryCardsSectionSettings,
} from "./service/categoryCardsService";
import {
  CategoryCardModal,
  CategoryCardsTable,
  DeleteConfirmationModal,
} from "./components";

export default function CategoryCards() {
  const [selectedPage, setSelectedPage] = useState("category-cards");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deleteCardId, setDeleteCardId] = useState(null);
  const [deleteCardName, setDeleteCardName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    headingText: "Popular Categories",
    headingColor: "#15803d",
    dividerColor: "#000000",
    sectionBackgroundColor: "",
  });
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSectionLoading(true);
      const data = await getCategoryCardsSectionSettings();
      if (!cancelled && data) {
        setSectionForm({
          headingText: data.headingText ?? "Popular Categories",
          headingColor: data.headingColor ?? "#15803d",
          dividerColor: data.dividerColor ?? "#000000",
          sectionBackgroundColor: data.sectionBackgroundColor ?? "",
        });
      }
      if (!cancelled) setSectionLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getAllCategoryCards();
      setCards(data);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleOpenModal = (card = null) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setProgress(50);

    try {
      const cardData = {
        categoryName: formData.categoryName.trim(),
        shopNowLink: formData.shopNowLink.trim(),
        itemCount: parseInt(formData.itemCount, 10) || 0,
        isActive: formData.isActive,
        categoryNameColor: formData.categoryNameColor || "#000000",
        itemCountColor: formData.itemCountColor || "#6B7280",
        overlayColor: formData.overlayColor?.trim() ?? "",
      };

      // Handle image files, keep existing URLs on edit, or clear when preview removed
      if (formData.backgroundImage instanceof File) {
        cardData.backgroundImage = formData.backgroundImage;
      } else if (selectedCard) {
        cardData.backgroundImage = formData.backgroundImagePreview || null;
      }

      if (formData.categoryImage instanceof File) {
        cardData.categoryImage = formData.categoryImage;
      } else if (selectedCard) {
        cardData.categoryImage = formData.categoryImagePreview || null;
      }

      let result;
      if (selectedCard) {
        result = await updateCategoryCard(selectedCard._id, cardData);
      } else {
        result = await createCategoryCard(cardData);
      }

      if (result) {
        handleCloseModal();
        await loadCards();
      }
    } catch (error) {
      console.error("Error submitting card:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteCardId(id);
    setDeleteCardName(name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteCardId) {
      setProgress(50);
      const result = await deleteCategoryCard(deleteCardId);
      if (result) {
        setIsDeleteModalOpen(false);
        setDeleteCardId(null);
        setDeleteCardName("");
        await loadCards();
      }
      setProgress(100);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    setProgress(50);
    const result = await toggleCategoryCardStatus(id, isActive);
    if (result) {
      await loadCards();
    }
    setProgress(100);
  };

  const handleReorder = async (cardIds) => {
    setProgress(50);
    const result = await reorderCategoryCards(cardIds);
    if (result) {
      await loadCards();
    }
    setProgress(100);
  };

  const handleSaveSection = async () => {
    setSectionSaving(true);
    setProgress(40);
    const result = await updateCategoryCardsSectionSettings(sectionForm);
    if (result) {
      setSectionForm({
        headingText: result.headingText ?? sectionForm.headingText,
        headingColor: result.headingColor ?? sectionForm.headingColor,
        dividerColor: result.dividerColor ?? sectionForm.dividerColor,
        sectionBackgroundColor: result.sectionBackgroundColor ?? "",
      });
    }
    setSectionSaving(false);
    setProgress(100);
  };

  return (
    <>
      <Helmet>
        <title>Category Cards - Admin</title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Category Cards
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage category card images displayed on the homepage
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Card
              </button>
            </div>

            {/* Homepage "Popular Categories" section */}
            <div className="mb-8 bg-white shadow rounded-lg overflow-hidden p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Popular Categories (homepage)
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Heading row above the carousel: title, divider line, and optional
                section background.
              </p>
              {sectionLoading ? (
                <p className="text-sm text-gray-500">Loading settings…</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Section heading text
                      </label>
                      <input
                        type="text"
                        value={sectionForm.headingText}
                        onChange={(e) =>
                          setSectionForm((s) => ({
                            ...s,
                            headingText: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                        maxLength={120}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Section background (optional)
                      </label>
                      <input
                        type="text"
                        value={sectionForm.sectionBackgroundColor}
                        onChange={(e) =>
                          setSectionForm((s) => ({
                            ...s,
                            sectionBackgroundColor: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm"
                        placeholder="Leave empty or e.g. #f8fafc or rgba(0,0,0,0.04)"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Heading text color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            /^#[0-9A-Fa-f]{6}$/i.test(sectionForm.headingColor)
                              ? sectionForm.headingColor
                              : "#15803d"
                          }
                          onChange={(e) =>
                            setSectionForm((s) => ({
                              ...s,
                              headingColor: e.target.value,
                            }))
                          }
                          className="h-9 w-12 cursor-pointer border border-gray-300 rounded-md p-1"
                        />
                        <input
                          type="text"
                          value={sectionForm.headingColor}
                          onChange={(e) =>
                            setSectionForm((s) => ({
                              ...s,
                              headingColor: e.target.value,
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-2 text-sm"
                          placeholder="#15803d"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Divider line color
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            /^#[0-9A-Fa-f]{6}$/i.test(sectionForm.dividerColor)
                              ? sectionForm.dividerColor
                              : "#000000"
                          }
                          onChange={(e) =>
                            setSectionForm((s) => ({
                              ...s,
                              dividerColor: e.target.value,
                            }))
                          }
                          className="h-9 w-12 cursor-pointer border border-gray-300 rounded-md p-1"
                        />
                        <input
                          type="text"
                          value={sectionForm.dividerColor}
                          onChange={(e) =>
                            setSectionForm((s) => ({
                              ...s,
                              dividerColor: e.target.value,
                            }))
                          }
                          className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-2 text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSection}
                      disabled={sectionSaving}
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-secondary disabled:opacity-50"
                    >
                      {sectionSaving ? "Saving…" : "Save section settings"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cards Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <CategoryCardsTable
                cards={cards}
                loading={loading}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onReorder={handleReorder}
              />
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                About Category Cards:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Category cards are displayed in a carousel on the homepage</li>
                <li>Only active cards are shown on the website</li>
                <li>Drag and drop rows to reorder cards</li>
                <li>Background image recommended size: 313 × 413 pixels</li>
                <li>Category image recommended size: 240 × 224 pixels</li>
                <li>Use the exact category name as it appears in your categories system</li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <CategoryCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSubmit}
        card={selectedCard}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteCardId(null);
          setDeleteCardName("");
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteCardName}
      />
    </>
  );
}
