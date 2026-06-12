import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import BannerModal from "./components/BannerModal";
import {
  createBanner,
  fetchAllBanners,
  fetchBannerById,
  updateBanner,
} from "./service/bannersService";

function createEmptyForm(order = 1) {
  return {
    type: "simple",
    backgroundMedia: "image",
    videoLarge: null,
    videoLargePreview: null,
    videoSmall: null,
    videoSmallPreview: null,
    removeVideoLarge: false,
    removeVideoSmall: false,
    overlayColor: "#000000",
    overlayOpacity: 35,
    videoDesktopLayout: "hero",
    videoDesktopWidthPx: "",
    videoDesktopHeightPx: "",
    videoMobileLayout: "hero",
    videoMobileWidthPx: "",
    videoMobileHeightPx: "",
    imageLargeWidthPx: 1200,
    imageLargeHeightPx: 417,
    imageSmallWidthPx: 1080,
    imageSmallHeightPx: 1920,
    imageLarge: null,
    imageLargePreview: null,
    imageSmall: null,
    imageSmallPreview: null,
    extraImage: null,
    extraImagePreview: null,
    altText: "",
    buttonText: "",
    buttonLink: "",
    content: {
      title: "",
      titleColor: "#FFFFFF",
      titleSize: "24px",
      subtitle: "",
      subtitleColor: "#FFFFFF",
      subtitleSize: "32px",
      paragraph: "",
      paragraphColor: "#FFFFFF",
      paragraphSize: "18px",
      price: "",
      priceColor: "#FF0000",
      priceSize: "20px",
      warranty: [],
      buynow: "",
      sellnow: "",
      textAlign: "left",
      textPosition: "right",
    },
    order,
    isActive: true,
  };
}

function mapBannerToForm(banner) {
  return {
    type: banner.type || "simple",
    backgroundMedia: banner.backgroundMedia === "video" ? "video" : "image",
    videoLarge: null,
    videoLargePreview: banner.videoLarge || null,
    videoSmall: null,
    videoSmallPreview: banner.videoSmall || null,
    removeVideoLarge: false,
    removeVideoSmall: false,
    overlayColor: banner.overlayColor || "#000000",
    overlayOpacity:
      banner.overlayOpacity !== undefined && banner.overlayOpacity !== null
        ? Number(banner.overlayOpacity)
        : 35,
    videoDesktopLayout: banner.videoDesktopLayout || "hero",
    videoDesktopWidthPx: banner.videoDesktopWidthPx ?? "",
    videoDesktopHeightPx: banner.videoDesktopHeightPx ?? "",
    videoMobileLayout: banner.videoMobileLayout || "hero",
    videoMobileWidthPx: banner.videoMobileWidthPx ?? "",
    videoMobileHeightPx: banner.videoMobileHeightPx ?? "",
    imageLargeWidthPx: banner.imageLargeWidthPx ?? 1200,
    imageLargeHeightPx: banner.imageLargeHeightPx ?? 417,
    imageSmallWidthPx: banner.imageSmallWidthPx ?? 1080,
    imageSmallHeightPx: banner.imageSmallHeightPx ?? 1920,
    imageLarge: null,
    imageLargePreview: banner.imageLarge || null,
    imageSmall: null,
    imageSmallPreview: banner.imageSmall || null,
    extraImage: null,
    extraImagePreview: banner.extraImage || null,
    altText: banner.altText || "",
    buttonText: banner.buttonText || "",
    buttonLink: banner.buttonLink || "",
    content: {
      title: banner.content?.title || "",
      titleColor: banner.content?.titleColor || "#FFFFFF",
      titleSize: banner.content?.titleSize || "24px",
      subtitle: banner.content?.subtitle || "",
      subtitleColor: banner.content?.subtitleColor || "#FFFFFF",
      subtitleSize: banner.content?.subtitleSize || "32px",
      paragraph: banner.content?.paragraph || "",
      paragraphColor: banner.content?.paragraphColor || "#FFFFFF",
      paragraphSize: banner.content?.paragraphSize || "18px",
      price: banner.content?.price || "",
      priceColor: banner.content?.priceColor || "#FF0000",
      priceSize: banner.content?.priceSize || "20px",
      warranty: banner.content?.warranty || [],
      buynow: banner.content?.buynow || "",
      sellnow: banner.content?.sellnow || "",
      textAlign: ["left", "center", "right"].includes(banner.content?.textAlign)
        ? banner.content.textAlign
        : "left",
      textPosition: ["left", "center", "right"].includes(
        banner.content?.textPosition
      )
        ? banner.content.textPosition
        : "right",
    },
    order: banner.order || "",
    isActive: banner.isActive !== undefined ? banner.isActive : true,
  };
}

export default function BannerEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [selectedPage, setSelectedPage] = useState("banners");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(createEmptyForm(1));

  const pageTitle = useMemo(
    () => (isEdit ? "Edit Banner - Admin" : "Create Banner - Admin"),
    [isEdit]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (isEdit && id) {
          const banner = await fetchBannerById(id);
          if (!cancelled) {
            if (!banner) {
              toast.error("Banner not found");
              navigate("/admin/banners");
              return;
            }
            setFormData(mapBannerToForm(banner));
          }
          return;
        }
        const all = await fetchAllBanners();
        const nextOrder =
          all.length > 0 ? Math.max(...all.map((b) => b.order || 0)) + 1 : 1;
        if (!cancelled) {
          setFormData(createEmptyForm(nextOrder));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const bannerData = {
        type: formData.type,
        backgroundMedia: formData.backgroundMedia === "video" ? "video" : "image",
        overlayColor: formData.overlayColor || "#000000",
        overlayOpacity: Math.min(
          100,
          Math.max(0, Math.round(Number(formData.overlayOpacity ?? 35)))
        ),
        videoDesktopLayout: formData.videoDesktopLayout || "hero",
        videoMobileLayout: formData.videoMobileLayout || "hero",
        videoDesktopWidthPx:
          formData.videoDesktopWidthPx === "" ||
          formData.videoDesktopWidthPx === undefined
            ? undefined
            : Math.round(Number(formData.videoDesktopWidthPx)),
        videoDesktopHeightPx:
          formData.videoDesktopHeightPx === "" ||
          formData.videoDesktopHeightPx === undefined
            ? undefined
            : Math.round(Number(formData.videoDesktopHeightPx)),
        videoMobileWidthPx:
          formData.videoMobileWidthPx === "" ||
          formData.videoMobileWidthPx === undefined
            ? undefined
            : Math.round(Number(formData.videoMobileWidthPx)),
        videoMobileHeightPx:
          formData.videoMobileHeightPx === "" ||
          formData.videoMobileHeightPx === undefined
            ? undefined
            : Math.round(Number(formData.videoMobileHeightPx)),
        imageLargeWidthPx: Math.round(Number(formData.imageLargeWidthPx) || 1200),
        imageLargeHeightPx: Math.round(Number(formData.imageLargeHeightPx) || 417),
        imageSmallWidthPx: Math.round(Number(formData.imageSmallWidthPx) || 1080),
        imageSmallHeightPx: Math.round(Number(formData.imageSmallHeightPx) || 1920),
        altText: formData.altText,
        order: parseInt(formData.order, 10) || 1,
        isActive: formData.isActive,
      };
      if (formData.removeVideoLarge) bannerData.removeVideoLarge = true;
      if (formData.removeVideoSmall) bannerData.removeVideoSmall = true;
      if (formData.videoLarge instanceof File) bannerData.videoLarge = formData.videoLarge;
      if (formData.videoSmall instanceof File) bannerData.videoSmall = formData.videoSmall;
      if (formData.type === "simple") {
        bannerData.buttonText = formData.buttonText;
        bannerData.buttonLink = formData.buttonLink;
      } else {
        bannerData.content = formData.content;
      }
      const isPersistedImageUrl = (value) =>
        typeof value === "string" &&
        value.trim() !== "" &&
        !value.startsWith("blob:");

      if (formData.imageLarge instanceof File) {
        bannerData.imageLarge = formData.imageLarge;
      } else if (isPersistedImageUrl(formData.imageLargePreview)) {
        bannerData.imageLarge = formData.imageLargePreview;
      }
      if (formData.imageSmall instanceof File) {
        bannerData.imageSmall = formData.imageSmall;
      } else if (isPersistedImageUrl(formData.imageSmallPreview)) {
        bannerData.imageSmall = formData.imageSmallPreview;
      }
      if (formData.type === "full" && formData.extraImage instanceof File) {
        bannerData.extraImage = formData.extraImage;
      }
      const result = isEdit && id
        ? await updateBanner(id, bannerData)
        : await createBanner(bannerData);
      if (result) {
        navigate("/admin/banners");
      }
    } catch (error) {
      console.error("Error submitting banner:", error);
      toast.error("Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={() => setIsSidebarOpen(false)}
        toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEdit ? "Edit Banner" : "Create New Banner"}
                </h1>
                <p className="mt-2 text-gray-600">
                  {isEdit
                    ? "Update banner content and media"
                    : "Create a new hero banner for the storefront carousel"}
                </p>
              </div>
              <Link
                to="/admin/banners"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Back to Banners
              </Link>
            </div>

            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
              </div>
            ) : (
              <BannerModal
                asPage
                isOpen
                onClose={() => navigate("/admin/banners")}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                isEdit={isEdit}
                loading={isSubmitting}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
