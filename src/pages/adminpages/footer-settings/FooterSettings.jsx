"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Tab } from "@headlessui/react";
import {
  getFooterSettings,
  saveFooterSettings,
  updateFooterSection,
  uploadFooterImage,
  getDefaultFooterSettings,
} from "./service/footerService";
import Section1Editor from "./components/Section1Editor";
import Section2Editor from "./components/Section2Editor";
import Section3Editor from "./components/Section3Editor";
import NewsletterSectionEditor from "./components/NewsletterSectionEditor";
import BottomBarEditor from "./components/BottomBarEditor";

function mergeFooterPayload(data) {
  if (!data) return data;
  const defaults = getDefaultFooterSettings();
  return {
    ...data,
    section1: {
      ...data.section1,
      description: data.section1?.description ?? "",
    },
    bottomBar: {
      ...defaults.bottomBar,
      ...(data.bottomBar ?? {}),
    },
  };
}

export default function FooterSettings() {
  const [selectedPage, setSelectedPage] = useState("footer-settings");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [footerData, setFooterData] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const auth = useAuth();

  // Fetch footer settings on mount
  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    setIsLoading(true);
    try {
      const result = await getFooterSettings(auth.ip);
      if (result.success && result.data) {
        setFooterData(mergeFooterPayload(result.data));
      } else {
        const defaults = getDefaultFooterSettings();
        setFooterData(mergeFooterPayload(defaults));
      }
    } catch (error) {
      console.error("Error fetching footer settings:", error);
      const defaults = getDefaultFooterSettings();
      setFooterData(mergeFooterPayload(defaults));
      toast.error("Failed to load footer settings. Using defaults.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSection = async (sectionName, sectionData) => {
    setIsSaving(true);
    try {
      const result = await updateFooterSection(sectionName, sectionData, auth.ip);
      if (result.success) {
        // Update local state
        setFooterData((prev) => ({
          ...prev,
          [sectionName]: sectionData,
        }));
        toast.success("Section saved successfully!");
      } else {
        toast.error(result.message || "Failed to save section");
      }
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Failed to save section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    if (!footerData) return;
    setIsSaving(true);
    try {
      const result = await saveFooterSettings(footerData, auth.ip);
      if (result.success) {
        toast.success("All footer settings saved successfully!");
      } else {
        toast.error(result.message || "Failed to save footer settings");
      }
    } catch (error) {
      console.error("Error saving footer settings:", error);
      toast.error("Failed to save footer settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  if (isLoading) {
    return (
      <>
        <Side
          selectedPage={selectedPage}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
        <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
          <Top
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
          />
          <main className="py-5">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          </main>
        </div>
      </>
    );
  }

  const tabs = [
    { name: "Section 1: Logo & Social Media", section: "section1" },
    { name: "Section 2: Useful Links", section: "section2" },
    { name: "Section 3: Customer Care", section: "section3" },
    { name: "Newsletter", section: "sectionNewsletter" },
    { name: "Bottom bar", section: "bottomBar" },
  ];

  return (
    <>
      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
        <main className="py-5">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Footer Settings</h1>
                <p className="text-gray-600 mt-2">
                  Manage your website footer content and links
                </p>
              </div>
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Save All</span>
                  </>
                )}
              </button>
            </div>

            {/* Tabs */}
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-1 rounded-xl bg-purple-100 p-1 mb-6 overflow-x-auto">
                {tabs.map((tab, index) => (
                  <Tab
                    key={index}
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-4 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-purple-700 shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-purple-600"
                      }`
                    }
                  >
                    {tab.name}
                  </Tab>
                ))}
              </Tab.List>

              <Tab.Panels>
                {/* Section 1: Logo & Social Media */}
                <Tab.Panel>
                  <Section1Editor
                    data={footerData?.section1}
                    onSave={(data) => handleSaveSection("section1", data)}
                    onUploadImage={uploadFooterImage}
                    backendUrl={auth.ip}
                    isSaving={isSaving}
                  />
                </Tab.Panel>

                {/* Section 2: Useful Links */}
                <Tab.Panel>
                  <Section2Editor
                    data={footerData?.section2}
                    onSave={(data) => handleSaveSection("section2", data)}
                    isSaving={isSaving}
                  />
                </Tab.Panel>

                {/* Section 3: Customer Care */}
                <Tab.Panel>
                  <Section3Editor
                    data={footerData?.section3}
                    onSave={(data) => handleSaveSection("section3", data)}
                    isSaving={isSaving}
                  />
                </Tab.Panel>

                <Tab.Panel>
                  <NewsletterSectionEditor
                    data={footerData?.sectionNewsletter}
                    onSave={(data) =>
                      handleSaveSection("sectionNewsletter", data)
                    }
                    isSaving={isSaving}
                  />
                </Tab.Panel>

                <Tab.Panel>
                  <BottomBarEditor
                    data={footerData?.bottomBar}
                    onSave={(data) => handleSaveSection("bottomBar", data)}
                    isSaving={isSaving}
                  />
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </main>
      </div>
    </>
  );
}
