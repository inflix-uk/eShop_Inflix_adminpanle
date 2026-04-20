import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  getBuyNowPayLater,
  updateBuyNowPayLater,
  getSellBuyCards,
  updateSellBuyCards,
  getTinyPhoneBanner,
  updateTinyPhoneBanner,
} from "./service/promotionalSectionsService";
import {
  BuyNowPayLaterModal,
  SellBuyCardsModal,
  TinyPhoneBannerModal,
} from "./components";

export default function PromotionalSections() {
  const [selectedPage, setSelectedPage] = useState("promotional-sections");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [buyNowPayLaterData, setBuyNowPayLaterData] = useState(null);
  const [sellBuyCardsData, setSellBuyCardsData] = useState(null);
  const [tinyPhoneBannerData, setTinyPhoneBannerData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  
  const [isBuyNowModalOpen, setIsBuyNowModalOpen] = useState(false);
  const [isSellBuyModalOpen, setIsSellBuyModalOpen] = useState(false);
  const [isTinyPhoneModalOpen, setIsTinyPhoneModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const [buyNow, sellBuy, tinyPhone] = await Promise.all([
        getBuyNowPayLater(),
        getSellBuyCards(),
        getTinyPhoneBanner(),
      ]);
      
      setBuyNowPayLaterData(buyNow);
      setSellBuyCardsData(sellBuy);
      setTinyPhoneBannerData(tinyPhone);
    } catch (error) {
      console.error("Error loading promotional sections:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleBuyNowSubmit = async (formData) => {
    setIsSubmitting(true);
    setProgress(50);

    try {
      const bannerData = {
        heading: formData.heading.trim(),
        paragraph: formData.paragraph.trim(),
      };

      if (formData.backgroundImage instanceof File) {
        bannerData.backgroundImage = formData.backgroundImage;
      } else if (formData.backgroundImagePreview && buyNowPayLaterData) {
        bannerData.backgroundImage = formData.backgroundImagePreview;
      }

      const paymentImages = [];
      formData.paymentImages.forEach((img, index) => {
        if (img instanceof File) {
          paymentImages.push(img);
        } else if (formData.paymentImagePreviews[index] && buyNowPayLaterData) {
          paymentImages.push(formData.paymentImagePreviews[index]);
        } else {
          paymentImages.push(null);
        }
      });
      bannerData.paymentImages = paymentImages;

      const result = await updateBuyNowPayLater(bannerData);
      if (result) {
        setIsBuyNowModalOpen(false);
        await loadAllData();
      }
    } catch (error) {
      console.error("Error submitting Buy Now Pay Later:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleSellBuySubmit = async (formData) => {
    setIsSubmitting(true);
    setProgress(50);

    try {
      const cardsData = {
        sellCard: {
          heading: formData.sellCard.heading.trim(),
          paragraph: formData.sellCard.paragraph.trim(),
          buttonName: formData.sellCard.buttonName.trim(),
          buttonLink: formData.sellCard.buttonLink.trim(),
        },
        buyCard: {
          heading: formData.buyCard.heading.trim(),
          paragraph: formData.buyCard.paragraph.trim(),
          buttonName: formData.buyCard.buttonName.trim(),
          buttonLink: formData.buyCard.buttonLink.trim(),
        },
      };

      // Handle images
      if (formData.sellCard.backgroundImage instanceof File) {
        cardsData.sellCard.backgroundImage = formData.sellCard.backgroundImage;
      } else if (formData.sellCard.backgroundImagePreview && sellBuyCardsData) {
        cardsData.sellCard.backgroundImage = formData.sellCard.backgroundImagePreview;
      }

      if (formData.sellCard.productImage instanceof File) {
        cardsData.sellCard.productImage = formData.sellCard.productImage;
      } else if (formData.sellCard.productImagePreview && sellBuyCardsData) {
        cardsData.sellCard.productImage = formData.sellCard.productImagePreview;
      }

      if (formData.buyCard.backgroundImage instanceof File) {
        cardsData.buyCard.backgroundImage = formData.buyCard.backgroundImage;
      } else if (formData.buyCard.backgroundImagePreview && sellBuyCardsData) {
        cardsData.buyCard.backgroundImage = formData.buyCard.backgroundImagePreview;
      }

      if (formData.buyCard.productImage instanceof File) {
        cardsData.buyCard.productImage = formData.buyCard.productImage;
      } else if (formData.buyCard.productImagePreview && sellBuyCardsData) {
        cardsData.buyCard.productImage = formData.buyCard.productImagePreview;
      }

      const result = await updateSellBuyCards(cardsData);
      if (result) {
        setIsSellBuyModalOpen(false);
        await loadAllData();
      }
    } catch (error) {
      console.error("Error submitting Sell/Buy Cards:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleTinyPhoneSubmit = async (formData) => {
    setIsSubmitting(true);
    setProgress(50);

    try {
      const bannerData = {
        heading: formData.heading.trim(),
        paragraph: formData.paragraph.trim(),
        buttonName: formData.buttonName.trim(),
        buttonLink: formData.buttonLink.trim(),
      };

      if (formData.backgroundImage instanceof File) {
        bannerData.backgroundImage = formData.backgroundImage;
      } else if (formData.backgroundImagePreview && tinyPhoneBannerData) {
        bannerData.backgroundImage = formData.backgroundImagePreview;
      }

      if (formData.centerImage instanceof File) {
        bannerData.centerImage = formData.centerImage;
      } else if (formData.centerImagePreview && tinyPhoneBannerData) {
        bannerData.centerImage = formData.centerImagePreview;
      }

      if (formData.rightImage instanceof File) {
        bannerData.rightImage = formData.rightImage;
      } else if (formData.rightImagePreview && tinyPhoneBannerData) {
        bannerData.rightImage = formData.rightImagePreview;
      }

      const result = await updateTinyPhoneBanner(bannerData);
      if (result) {
        setIsTinyPhoneModalOpen(false);
        await loadAllData();
      }
    } catch (error) {
      console.error("Error submitting Tiny Phone Banner:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Promotional Sections - Admin</title>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Promotional Sections
              </h1>
              <p className="mt-2 text-gray-600">
                Three stacked homepage promos: top banner, two cards in one row, then a bottom strip.
                Each section opens in its own editor.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-600">Loading promotional sections...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Top banner */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Top banner (full width)
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        On the site: first wide strip under the hero. Suggested background 1216 × 160
                        px; optional payment logos ~96 × 40 px (up to 3).
                      </p>
                    </div>
                    <button
                      onClick={() => setIsBuyNowModalOpen(true)}
                      className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {buyNowPayLaterData ? "Edit Banner" : "Create Banner"}
                    </button>
                  </div>
                </div>

                {/* Two cards */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Two cards (side by side)
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        On the site: two equal tiles under the top banner (left card, then right).
                        Suggested background per card: 540 × 220 px.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSellBuyModalOpen(true)}
                      className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {sellBuyCardsData ? "Edit Cards" : "Create Cards"}
                    </button>
                  </div>
                </div>

                {/* Bottom strip */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Bottom strip (full width)
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        On the site: last band in this block — text, button, and images. Suggested:
                        background 1216 × 160 px, center ~389 × 80 px, right ~137 × 112 px.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsTinyPhoneModalOpen(true)}
                      className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {tinyPhoneBannerData ? "Edit Banner" : "Create Banner"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals - only render when open for clean mount/unmount */}
      {isBuyNowModalOpen && (
        <BuyNowPayLaterModal
          isOpen={true}
          onClose={() => setIsBuyNowModalOpen(false)}
          onSave={handleBuyNowSubmit}
          data={buyNowPayLaterData}
          isSubmitting={isSubmitting}
        />
      )}

      {isSellBuyModalOpen && (
        <SellBuyCardsModal
          isOpen={true}
          onClose={() => setIsSellBuyModalOpen(false)}
          onSave={handleSellBuySubmit}
          data={sellBuyCardsData}
          isSubmitting={isSubmitting}
        />
      )}

      {isTinyPhoneModalOpen && (
        <TinyPhoneBannerModal
          isOpen={true}
          onClose={() => setIsTinyPhoneModalOpen(false)}
          onSave={handleTinyPhoneSubmit}
          data={tinyPhoneBannerData}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
}
