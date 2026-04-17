import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import ProductCentralTabs from "./ProductCentralTabs";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../context/Auth";
import axios from "axios";
import { toast } from "react-toastify";
import JoditEditor from "jodit-react";

// Import icon assets
import Adapter from "../../../assets/Adapter";
import PowerCable from "../../../assets/PowerCable";
import ProtectionBundle from "../../../assets/ProtectionBundle";
import Tree from "../../../assets/Tree";
import hdmiCableImg from "../../../assets/hdmi-cable.png";
import powerCableNewImg from "../../../assets/Pawer-cable.png";
import onexControllerImg from "../../../assets/onexcontroller.png";
import twoxControllerImg from "../../../assets/twoxcontroller.png";
import simImg from "../../../assets/sim.png";
import screenProtectorImg from "../../../assets/screenprotector.png";
import backCoverImg from "../../../assets/backcover.png";

// Product Options slugs that should NOT appear in Variant Attributes (they have their own page)
const PRODUCT_OPTIONS_SLUGS = ["select_options", "top_section", "comes_with"];

export default function ProductCentralVariantAttributes() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [selectedTab, setSelectedTab] = useState("variant-attributes");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [variantAttributes, setVariantAttributes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedValues, setExpandedValues] = useState({});
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [valueSearchTerm, setValueSearchTerm] = useState("");

  // Detail View State
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  // Modal States
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [editingValue, setEditingValue] = useState(null);
  const [editingModel, setEditingModel] = useState(null);
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);
  const [selectedValueSlug, setSelectedValueSlug] = useState(null);

  // Form States
  const [attributeForm, setAttributeForm] = useState({
    name: "",
    description: "",
    hasModels: false,
    isActive: true,
  });
  const [valueForm, setValueForm] = useState({ name: "", isActive: true, colorCode: "", icon: "", description: "" });

  // Available icons for "Comes With" attribute
  const AVAILABLE_ICONS = [
    { id: "powerAdapter", name: "Power Adapter", type: "component", component: Adapter },
    { id: "chargingCable", name: "Charging Cable", type: "component", component: PowerCable },
    { id: "protectionBundle", name: "Protection Bundle", type: "component", component: ProtectionBundle },
    { id: "treePlanted", name: "Tree Planted", type: "component", component: Tree },
    { id: "hdmiCable", name: "HDMI Cable", type: "image", src: hdmiCableImg },
    { id: "powerCableNew", name: "Power Cable", type: "image", src: powerCableNewImg },
    { id: "onexController", name: "1x Controller", type: "image", src: onexControllerImg },
    { id: "twoxController", name: "2x Controller", type: "image", src: twoxControllerImg },
    { id: "freeSim", name: "Free Sim", type: "image", src: simImg },
    { id: "screenProtector", name: "Screen Protector", type: "image", src: screenProtectorImg },
    { id: "backCover", name: "Back Cover", type: "image", src: backCoverImg },
  ];

  // State for custom icon input
  const [useCustomIcon, setUseCustomIcon] = useState(false);
  const [customIconCode, setCustomIconCode] = useState("");

  const [modelForm, setModelForm] = useState({ name: "", isActive: true });

  // Helper function to render icon preview
  const renderIconPreview = (iconId, customIcon = null) => {
    if (customIcon) {
      return (
        <span
          className="flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: customIcon }}
        />
      );
    }
    if (!iconId) return null;
    const iconData = AVAILABLE_ICONS.find((i) => i.id === iconId);
    if (!iconData) {
      // Check if it's a custom HTML icon string
      if (typeof iconId === "string" && iconId.includes("<")) {
        return (
          <span
            className="flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: iconId }}
          />
        );
      }
      return null;
    }
    if (iconData.type === "component") {
      const IconComponent = iconData.component;
      return <IconComponent className="w-6 h-6" />;
    }
    return <img src={iconData.src} alt={iconData.name} className="w-6 h-6 object-contain" />;
  };

  // Rich text editor config for "Comes With" description
  const descriptionEditorRef = useRef(null);
  const editorConfig = useMemo(() => ({
    readonly: false,
    height: 200,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "fontsize",
      "paragraph",
      "|",
      "link",
      "align",
      "|",
      "undo",
      "redo",
    ],
    controls: {
      fontsize: {
        list: ["12", "14", "16", "18", "20", "24", "28", "32"],
      },
      paragraph: {
        list: {
          p: "Normal",
          h1: "Heading 1",
          h2: "Heading 2",
          h3: "Heading 3",
          h4: "Heading 4",
        },
      },
    },
    toolbarSticky: false,
    showXPathInStatusbar: false,
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarAdaptive: false,
  }), []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Load Flaticon CSS for custom icons
  useEffect(() => {
    const flatIconStyles = [
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-rounded/css/uicons-regular-rounded.css',
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-rounded/css/uicons-bold-rounded.css',
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-rounded/css/uicons-solid-rounded.css',
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-regular-straight/css/uicons-regular-straight.css',
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-bold-straight/css/uicons-bold-straight.css',
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-solid-straight/css/uicons-solid-straight.css',
      'https://cdn-uicons.flaticon.com/2.6.0/uicons-brands/css/uicons-brands.css',
    ];

    flatIconStyles.forEach((href) => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }, []);

  // Fetch variant attributes
  useEffect(() => {
    fetchVariantAttributes();
  }, [auth.ip]);

  // Restore selected attribute from URL params after data loads
  useEffect(() => {
    if (variantAttributes.length > 0) {
      const attributeId = searchParams.get("attribute");
      if (attributeId && !selectedAttribute) {
        const attribute = variantAttributes.find(a => a._id === attributeId);
        if (attribute) {
          setSelectedAttribute(attribute);
        }
      }
    }
  }, [variantAttributes, searchParams]);

  // Update selected attribute when data changes
  useEffect(() => {
    if (selectedAttribute) {
      const updated = variantAttributes.find(a => a._id === selectedAttribute._id);
      if (updated) {
        setSelectedAttribute(updated);
      }
    }
  }, [variantAttributes]);

  const fetchVariantAttributes = async () => {
    setProgress(30);
    setIsLoading(true);
    try {
      const response = await axios.get(`${auth.ip}get/variant-attributes`);
      if (response.data.status === 200 || response.data.status === 201) {
        // Filter out product options (they have their own page)
        const variantAttrs = (response.data.variantAttributes || []).filter(
          attr => !PRODUCT_OPTIONS_SLUGS.includes(attr.slug)
        );
        setVariantAttributes(variantAttrs);
      }
      setProgress(100);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching variant attributes:", error);
      setProgress(100);
      setIsLoading(false);
    }
  };

  // Toggle attribute active status
  const toggleAttributeStatus = async (attributeId, currentStatus) => {
    try {
      const response = await axios.put(
        `${auth.ip}update/variant-attribute/${attributeId}`,
        { isActive: !currentStatus }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Status updated successfully");
        fetchVariantAttributes();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Toggle value active status
  const toggleValueStatus = async (attributeId, valueSlug, currentStatus) => {
    try {
      const response = await axios.put(
        `${auth.ip}update/variant-attribute-value/${attributeId}/${valueSlug}`,
        { isActive: !currentStatus }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Value status updated successfully");
        fetchVariantAttributes();
      }
    } catch (error) {
      toast.error("Failed to update value status");
    }
  };

  // Toggle model active status
  const toggleModelStatus = async (attributeId, valueSlug, modelSlug, currentStatus) => {
    try {
      const response = await axios.put(
        `${auth.ip}update/variant-attribute-model/${attributeId}/${valueSlug}/${modelSlug}`,
        { isActive: !currentStatus }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Model status updated successfully");
        fetchVariantAttributes();
      }
    } catch (error) {
      toast.error("Failed to update model status");
    }
  };

  // Soft delete attribute
  const softDeleteAttribute = async (attributeId) => {
    if (!window.confirm("Are you sure you want to delete this attribute? This action can be undone by an admin.")) {
      return;
    }
    try {
      const response = await axios.put(
        `${auth.ip}update/variant-attribute/${attributeId}`,
        { isDeleted: true }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Attribute deleted successfully");
        closeDetailView();
        fetchVariantAttributes();
      }
    } catch (error) {
      toast.error("Failed to delete attribute");
    }
  };

  // Soft delete value
  const softDeleteValue = async (attributeId, valueSlug) => {
    if (!window.confirm("Are you sure you want to delete this value? This action can be undone by an admin.")) {
      return;
    }
    try {
      const response = await axios.put(
        `${auth.ip}update/variant-attribute-value/${attributeId}/${valueSlug}`,
        { isDeleted: true }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Value deleted successfully");
        fetchVariantAttributes();
      }
    } catch (error) {
      toast.error("Failed to delete value");
    }
  };

  // Soft delete model
  const softDeleteModel = async (attributeId, valueSlug, modelSlug) => {
    if (!window.confirm("Are you sure you want to delete this model? This action can be undone by an admin.")) {
      return;
    }
    try {
      const response = await axios.put(
        `${auth.ip}update/variant-attribute-model/${attributeId}/${valueSlug}/${modelSlug}`,
        { isDeleted: true }
      );
      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Model deleted successfully");
        fetchVariantAttributes();
      }
    } catch (error) {
      toast.error("Failed to delete model");
    }
  };

  // Create/Update attribute
  const handleAttributeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAttribute) {
        const response = await axios.put(
          `${auth.ip}update/variant-attribute/${editingAttribute._id}`,
          attributeForm
        );
        if (response.data.status === 200 || response.data.status === 201) {
          toast.success("Attribute updated successfully");
        }
      } else {
        const response = await axios.post(
          `${auth.ip}create/variant-attribute`,
          { ...attributeForm, values: [] }
        );
        if (response.data.status === 200 || response.data.status === 201) {
          toast.success("Attribute created successfully");
        }
      }
      setShowAttributeModal(false);
      setEditingAttribute(null);
      setAttributeForm({ name: "", description: "", hasModels: false, isActive: true });
      fetchVariantAttributes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  // Add/Edit value to attribute
  const handleValueSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingValue) {
        // Update existing value
        const response = await axios.put(
          `${auth.ip}update/variant-attribute-value-details/${selectedAttributeId}/${editingValue.slug}`,
          valueForm
        );
        if (response.data.status === 200 || response.data.status === 201) {
          toast.success("Value updated successfully");
        }
      } else {
        // Add new value
        const response = await axios.post(
          `${auth.ip}add/variant-attribute-value/${selectedAttributeId}`,
          valueForm
        );
        if (response.data.status === 200 || response.data.status === 201) {
          toast.success("Value added successfully");
        }
      }
      setShowValueModal(false);
      setEditingValue(null);
      setValueForm({ name: "", isActive: true, colorCode: "", icon: "", description: "" });
      fetchVariantAttributes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save value");
    }
  };

  // Add/Edit model to value
  const handleModelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModel) {
        // Update existing model
        const response = await axios.put(
          `${auth.ip}update/variant-attribute-model-details/${selectedAttributeId}/${selectedValueSlug}/${editingModel.slug}`,
          modelForm
        );
        if (response.data.status === 200 || response.data.status === 201) {
          toast.success("Model updated successfully");
        }
      } else {
        // Add new model
        const response = await axios.post(
          `${auth.ip}add/variant-attribute-model/${selectedAttributeId}/${selectedValueSlug}`,
          modelForm
        );
        if (response.data.status === 200 || response.data.status === 201) {
          toast.success("Model added successfully");
        }
      }
      setShowModelModal(false);
      setEditingModel(null);
      setModelForm({ name: "", isActive: true });
      fetchVariantAttributes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save model");
    }
  };

  // Open edit attribute modal
  const openEditAttribute = (attribute, e) => {
    if (e) e.stopPropagation();
    setEditingAttribute(attribute);
    setAttributeForm({
      name: attribute.name,
      description: attribute.description || "",
      hasModels: attribute.hasModels || false,
      isActive: attribute.isActive,
    });
    setShowAttributeModal(true);
  };

  // Open add value modal
  const openAddValue = (attributeId) => {
    setSelectedAttributeId(attributeId);
    setEditingValue(null);
    setValueForm({ name: "", isActive: true, colorCode: "", icon: "", description: "" });
    setUseCustomIcon(false);
    setCustomIconCode("");
    setShowValueModal(true);
  };

  // Open edit value modal
  const openEditValue = (attributeId, value, e) => {
    if (e) e.stopPropagation();
    setSelectedAttributeId(attributeId);
    setEditingValue(value);
    setValueForm({ name: value.name, isActive: value.isActive, colorCode: value.colorCode || "", icon: value.icon || "", description: value.description || "" });
    // Check if the icon is a custom HTML icon
    const isCustomIcon = value.icon && typeof value.icon === "string" && value.icon.includes("<");
    setUseCustomIcon(isCustomIcon);
    setCustomIconCode(isCustomIcon ? value.icon : "");
    setShowValueModal(true);
  };

  // Open add model modal
  const openAddModel = (attributeId, valueSlug) => {
    setSelectedAttributeId(attributeId);
    setSelectedValueSlug(valueSlug);
    setEditingModel(null);
    setModelForm({ name: "", isActive: true });
    setShowModelModal(true);
  };

  // Open edit model modal
  const openEditModel = (attributeId, valueSlug, model, e) => {
    if (e) e.stopPropagation();
    setSelectedAttributeId(attributeId);
    setSelectedValueSlug(valueSlug);
    setEditingModel(model);
    setModelForm({ name: model.name, isActive: model.isActive });
    setShowModelModal(true);
  };

  // Open detail view
  const openDetailView = (attribute) => {
    setSelectedAttribute(attribute);
    setExpandedValues({});
    setModelSearchTerm("");
    setValueSearchTerm("");
    // Update URL with attribute ID
    setSearchParams({ attribute: attribute._id });
  };

  // Close detail view
  const closeDetailView = () => {
    setSelectedAttribute(null);
    setExpandedValues({});
    setModelSearchTerm("");
    setValueSearchTerm("");
    // Remove attribute from URL
    setSearchParams({});
  };

  // Filter attributes based on search
  const filteredAttributes = variantAttributes.filter(
    (attr) =>
      attr.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attr.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter values in detail view
  const filteredValues = selectedAttribute?.values?.filter(
    (value) =>
      value.name?.toLowerCase().includes(valueSearchTerm.toLowerCase())
  ) || [];

  // Get icon for attribute type
  const getAttributeIcon = (name) => {
    const icons = {
      Brands: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      Size: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      Color: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      Storage: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      RAM: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      default: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    };
    return icons[name] || icons.default;
  };

  // Render Detail View
  const renderDetailView = () => {
    const attribute = selectedAttribute;
    if (!attribute) return null;

    return (
      <div className="animate-fadeIn">
        {/* Back Button & Header */}
        <div className="mb-6">
          <button
            onClick={closeDetailView}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Attributes
          </button>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div
              className={`h-2 ${
                attribute.isActive
                  ? "bg-gradient-to-r from-blue-500 to-emerald-500"
                  : "bg-gradient-to-r from-gray-300 to-gray-400"
              }`}
            ></div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${
                      attribute.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {getAttributeIcon(attribute.name)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{attribute.name}</h2>
                    <p className="text-sm text-gray-400">Slug: {attribute.slug}</p>
                    {attribute.description && (
                      <p className="text-gray-500 mt-1">{attribute.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => openEditAttribute(attribute, e)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => softDeleteAttribute(attribute._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleAttributeStatus(attribute._id, attribute.isActive)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      attribute.isActive
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {attribute.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="font-medium">{attribute.values?.length || 0}</span>
                  <span>Values</span>
                </div>
                {attribute.hasModels && (
                  <>
                    <div className="flex items-center gap-2 text-purple-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="font-medium">
                        {attribute.values?.reduce((sum, v) => sum + (v.models?.length || 0), 0)}
                      </span>
                      <span>Total Models</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 text-blue-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">
                    {attribute.values?.filter(v => v.isActive).length || 0}
                  </span>
                  <span>Active Values</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Values</h3>
            <button
              onClick={() => openAddValue(attribute._id)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Value
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search values..."
                value={valueSearchTerm}
                onChange={(e) => setValueSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {attribute.hasModels && (
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search models..."
                  value={modelSearchTerm}
                  onChange={(e) => setModelSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <svg
                  className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Values List */}
          <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto">
            {filteredValues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {valueSearchTerm ? "No values match your search" : "No values yet. Add your first value."}
              </div>
            ) : (
              filteredValues.map((value, idx) => (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all"
                >
                  {/* Value Header */}
                  <div
                    className={`flex items-center justify-between p-4 ${
                      value.isActive ? "bg-gray-50" : "bg-gray-100"
                    } ${attribute.hasModels && value.models?.length > 0 ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (attribute.hasModels && value.models?.length > 0) {
                        setExpandedValues(prev => ({
                          ...prev,
                          [value.slug]: !prev[value.slug]
                        }));
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {attribute.hasModels && value.models?.length > 0 && (
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedValues[value.slug] ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                      {/* Color swatch for Color attribute */}
                      {attribute.name?.toLowerCase() === 'color' && value.colorCode && (
                        <div
                          className="w-8 h-8 rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: value.colorCode }}
                          title={value.colorCode}
                        />
                      )}
                      {/* Icon for values with icons (e.g., Comes With) */}
                      {value.icon && (
                        <div className="w-8 h-8 flex items-center justify-center bg-primary/10 rounded-lg flex-shrink-0">
                          {renderIconPreview(value.icon)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-base font-medium ${
                            value.isActive ? "text-gray-800" : "text-gray-400 line-through"
                          }`}
                        >
                          {value.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          slug: {value.slug}
                          {attribute.name?.toLowerCase() === 'color' && value.colorCode && (
                            <span className="ml-2 font-mono">{value.colorCode}</span>
                          )}
                        </p>
                        {attribute.hasModels && value.models?.length > 0 && (
                          <p className="text-sm text-purple-500 mt-1">
                            {value.models.length} models
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {attribute.hasModels && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAddModel(attribute._id, value.slug);
                          }}
                          className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Add Model"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={(e) => openEditValue(attribute._id, value, e)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Value"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          softDeleteValue(attribute._id, value.slug);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Value"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleValueStatus(attribute._id, value.slug, value.isActive);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                          value.isActive
                            ? "text-blue-600 hover:bg-blue-100"
                            : "text-gray-400 hover:bg-gray-200"
                        }`}
                        title={value.isActive ? "Deactivate" : "Activate"}
                      >
                        {value.isActive ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Models List - Expanded */}
                  {expandedValues[value.slug] && attribute.hasModels && value.models?.length > 0 && (
                    <div className="bg-white border-t border-gray-100 p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {value.models
                          .filter(model =>
                            !modelSearchTerm ||
                            model.name.toLowerCase().includes(modelSearchTerm.toLowerCase())
                          )
                          .map((model, modelIdx) => (
                            <div
                              key={modelIdx}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                                model.isActive
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              <div className="truncate flex-1 mr-2">
                                <span className={model.isActive ? "" : "line-through"}>{model.name}</span>
                                <p className="text-xs text-gray-400 font-mono truncate">{model.slug}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditModel(attribute._id, value.slug, model)}
                                  className="p-1 text-gray-400 hover:text-blue-500 rounded hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => softDeleteModel(attribute._id, value.slug, model.slug)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => toggleModelStatus(attribute._id, value.slug, model.slug, model.isActive)}
                                  className={`p-1 rounded ${model.isActive ? "hover:bg-purple-100" : "hover:bg-gray-200"}`}
                                  title={model.isActive ? "Deactivate" : "Activate"}
                                >
                                  {model.isActive ? (
                                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                      {value.models.filter(model =>
                        !modelSearchTerm ||
                        model.name.toLowerCase().includes(modelSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No models match your search</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Grid View
  const renderGridView = () => (
    <>
      {/* Search Bar */}
      <div className="mt-6 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search variant attributes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Attributes</p>
          <p className="text-2xl font-bold text-gray-900">
            {variantAttributes.length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Active Attributes</p>
          <p className="text-2xl font-bold text-blue-600">
            {variantAttributes.filter((a) => a.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Values</p>
          <p className="text-2xl font-bold text-blue-600">
            {variantAttributes.reduce(
              (sum, attr) => sum + (attr.values?.length || 0),
              0
            )}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">With Models</p>
          <p className="text-2xl font-bold text-purple-600">
            {variantAttributes.filter((a) => a.hasModels).length}
          </p>
        </div>
      </div>

      {/* Attributes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttributes.map((attribute) => (
            <div
              key={attribute._id}
              onClick={() => openDetailView(attribute)}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer group"
            >
              <div
                className={`h-1.5 ${
                  attribute.isActive
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500"
                    : "bg-gradient-to-r from-gray-300 to-gray-400"
                }`}
              ></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg transition-all group-hover:scale-110 ${
                        attribute.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {getAttributeIcon(attribute.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                        {attribute.name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {attribute.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => openEditAttribute(attribute, e)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        softDeleteAttribute(attribute._id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attribute.isActive
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {attribute.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {attribute.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {attribute.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {attribute.values?.length || 0} values
                  </span>
                  {attribute.hasModels && (
                    <span className="flex items-center gap-1 text-purple-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {attribute.values?.reduce((sum, v) => sum + (v.models?.length || 0), 0)} models
                    </span>
                  )}
                </div>

                {/* Values Preview */}
                <div className="flex flex-wrap gap-1.5">
                  {attribute.values?.slice(0, 4).map((value, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 text-xs rounded-md flex items-center gap-1.5 ${
                        value.isActive
                          ? "bg-blue-50 text-blue-700"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {attribute.name?.toLowerCase() === 'color' && value.colorCode && (
                        <span
                          className="w-3 h-3 rounded-full border border-white shadow-sm inline-block"
                          style={{ backgroundColor: value.colorCode }}
                        />
                      )}
                      {value.name}
                    </span>
                  ))}
                  {attribute.values?.length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 text-gray-500">
                      +{attribute.values.length - 4}
                    </span>
                  )}
                </div>

                {/* Click hint */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center text-sm text-gray-400 group-hover:text-primary transition-colors">
                  <span>Click to view details</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredAttributes.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No variant attributes found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first variant attribute to get started"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingAttribute(null);
                setAttributeForm({ name: "", description: "", hasModels: false, isActive: true });
                setShowAttributeModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Attribute
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <Helmet>
        <title>{selectedAttribute ? `${selectedAttribute.name} - Variant Attributes` : 'Variant Attributes'}</title>
      </Helmet>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header - Only show when not in detail view */}
            {!selectedAttribute && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <svg
                        className="w-8 h-8 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        Variant Attributes
                      </h1>
                      <p className="text-gray-500">
                        Manage all product variant types and their values
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingAttribute(null);
                      setAttributeForm({ name: "", description: "", hasModels: false, isActive: true });
                      setShowAttributeModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Attribute
                  </button>
                </div>
              </div>
            )}

            {!selectedAttribute && (
              <ProductCentralTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
            )}

            {/* Conditional Render: Detail View or Grid View */}
            {selectedAttribute ? renderDetailView() : renderGridView()}
          </div>
        </main>
      </div>

      {/* Add/Edit Attribute Modal */}
      {showAttributeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAttribute ? "Edit Attribute" : "Add New Attribute"}
            </h3>
            <form onSubmit={handleAttributeSubmit}>
              <div className="space-y-4">
                {editingAttribute && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Current Slug</p>
                    <p className="text-sm font-mono text-gray-700">{editingAttribute.slug}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={attributeForm.name}
                    onChange={(e) => setAttributeForm({ ...attributeForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g., Color, Size, Storage"
                    required
                  />
                  {attributeForm.name && (
                    <p className="text-xs text-gray-400 mt-1">
                      Slug: {attributeForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={attributeForm.description}
                    onChange={(e) => setAttributeForm({ ...attributeForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="Brief description of this attribute"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attributeForm.hasModels}
                      onChange={(e) => setAttributeForm({ ...attributeForm, hasModels: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Has Models (e.g., Brand → Models)</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attributeForm.isActive}
                      onChange={(e) => setAttributeForm({ ...attributeForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttributeModal(false);
                    setEditingAttribute(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  {editingAttribute ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Value Modal */}
      {showValueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-xl w-full p-6 ${(selectedAttribute?.slug === 'comes_with' || selectedAttribute?.slug === 'top_section') ? 'max-w-4xl' : 'max-w-md'}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingValue ? "Edit Value" : "Add New Value"}
            </h3>
            <form onSubmit={handleValueSubmit}>
              {/* Two-column layout for "Comes With" and "Top Section" attributes */}
              {(selectedAttribute?.slug === 'comes_with' || selectedAttribute?.slug === 'top_section') ? (
                <div className="flex gap-6">
                  {/* Left Section - Basic Info */}
                  <div className="w-1/2 space-y-4">
                    <div className="pb-2 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Basic Information
                      </h4>
                    </div>
                    {editingValue && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Current Slug</p>
                        <p className="text-sm font-mono text-gray-700">{editingValue.slug}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value Name *
                      </label>
                      <input
                        type="text"
                        value={valueForm.name}
                        onChange={(e) => setValueForm({ ...valueForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20"
                        placeholder="e.g., Power Adapter, Charging Cable"
                        required
                      />
                      {valueForm.name && (
                        <p className="text-xs text-gray-400 mt-1">
                          Slug: {valueForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>

                      {/* Icon Type Toggle */}
                      <div className="flex gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomIcon(false);
                            setCustomIconCode("");
                          }}
                          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            !useCustomIcon
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Predefined Icons
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomIcon(true);
                            setValueForm({ ...valueForm, icon: "" });
                          }}
                          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            useCustomIcon
                              ? "bg-primary text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Custom Icon
                        </button>
                      </div>

                      {!useCustomIcon ? (
                        /* Predefined Icons Grid */
                        <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 rounded-lg max-h-[180px] overflow-y-auto">
                          {/* No Icon Option */}
                          <button
                            type="button"
                            onClick={() => setValueForm({ ...valueForm, icon: "" })}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                              !valueForm.icon || valueForm.icon === ""
                                ? "border-primary bg-primary/10"
                                : "border-transparent hover:border-gray-300 hover:bg-white"
                            }`}
                            title="No Icon"
                          >
                            <div className="w-8 h-8 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">None</span>
                          </button>
                          {AVAILABLE_ICONS.map((icon) => (
                            <button
                              key={icon.id}
                              type="button"
                              onClick={() => setValueForm({ ...valueForm, icon: icon.id })}
                              className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${
                                valueForm.icon === icon.id
                                  ? "border-primary bg-primary/10"
                                  : "border-transparent hover:border-gray-300 hover:bg-white"
                              }`}
                              title={icon.name}
                            >
                              <div className="w-8 h-8 flex items-center justify-center">
                                {icon.type === "component" ? (
                                  <icon.component className="w-6 h-6" />
                                ) : (
                                  <img src={icon.src} alt={icon.name} className="w-6 h-6 object-contain" />
                                )}
                              </div>
                              <span className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">{icon.name}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        /* Custom Icon Input */
                        <div className="space-y-3">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <span className="font-medium text-blue-700">Flaticon:</span>
                              <code className="bg-blue-100 px-1 rounded text-[10px]">&lt;i class="fi fi-rr-home"&gt;&lt;/i&gt;</code>
                            </div>
                            <a
                              href="https://www.flaticon.com/uicons/interface-icons"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 font-medium whitespace-nowrap"
                            >
                              Browse
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                          <div>
                            <input
                              type="text"
                              value={customIconCode}
                              onChange={(e) => {
                                setCustomIconCode(e.target.value);
                                setValueForm({ ...valueForm, icon: e.target.value });
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono text-sm"
                              placeholder='<i class="fi fi-br-home"></i>'
                            />
                          </div>
                          {/* Icon Preview */}
                          {customIconCode && (
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
                              <span className="text-xs text-gray-500">Preview:</span>
                              <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-300">
                                <span
                                  className="text-xl text-gray-700"
                                  dangerouslySetInnerHTML={{ __html: customIconCode }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400">Classes: fi-rr-*, fi-br-*, fi-sr-*</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={valueForm.isActive}
                          onChange={(e) => setValueForm({ ...valueForm, isActive: e.target.checked })}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                      </label>
                    </div>
                  </div>

                  {/* Right Section - Description */}
                  <div className="w-1/2 space-y-4">
                    <div className="pb-2 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Description
                      </h4>
                    </div>
                    <div className="h-[calc(100%-2rem)]">
                      <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
                        <JoditEditor
                          ref={descriptionEditorRef}
                          value={valueForm.description}
                          config={{...editorConfig, height: 280}}
                          onBlur={(newContent) => setValueForm((prev) => ({ ...prev, description: newContent }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard single-column layout for other attributes */
                <div className="space-y-4">
                  {editingValue && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Current Slug</p>
                      <p className="text-sm font-mono text-gray-700">{editingValue.slug}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value Name *
                    </label>
                    <input
                      type="text"
                      value={valueForm.name}
                      onChange={(e) => setValueForm({ ...valueForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20"
                      placeholder="e.g., Red, 128GB, Large"
                      required
                    />
                    {valueForm.name && (
                      <p className="text-xs text-gray-400 mt-1">
                        Slug: {valueForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')}
                      </p>
                    )}
                  </div>
                  {/* Color Code field - only show for Color attribute */}
                  {selectedAttribute?.name?.toLowerCase() === 'color' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Code
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={valueForm.colorCode || "#000000"}
                          onChange={(e) => setValueForm({ ...valueForm, colorCode: e.target.value })}
                          className="w-12 h-10 p-1 border border-gray-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={valueForm.colorCode}
                          onChange={(e) => setValueForm({ ...valueForm, colorCode: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono"
                          placeholder="#FF0000"
                        />
                        {valueForm.colorCode && (
                          <div
                            className="w-10 h-10 rounded-lg border border-gray-200"
                            style={{ backgroundColor: valueForm.colorCode }}
                            title={valueForm.colorCode}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Select a color or enter a hex code (e.g., #FF0000)
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={valueForm.isActive}
                        onChange={(e) => setValueForm({ ...valueForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowValueModal(false);
                    setEditingValue(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  {editingValue ? "Update" : "Add Value"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingModel ? "Edit Model" : "Add New Model"}
            </h3>
            <form onSubmit={handleModelSubmit}>
              <div className="space-y-4">
                {editingModel && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Current Slug</p>
                    <p className="text-sm font-mono text-gray-700">{editingModel.slug}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                    required
                  />
                  {modelForm.name && (
                    <p className="text-xs text-gray-400 mt-1">
                      Slug: {modelForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/g, '')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modelForm.isActive}
                      onChange={(e) => setModelForm({ ...modelForm, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModelModal(false);
                    setEditingModel(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
                >
                  {editingModel ? "Update" : "Add Model"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
