import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CreatableSelect from "react-select/creatable";
import {
  BuildingStorefrontIcon,
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import {
  getReturnOrderOptionsGrouped,
  createReturnOrderOption,
} from "../../service";
import OptionManagementModal from "./OptionManagementModal";

const selectStyles = {
  control: (provided) => ({
    ...provided,
    borderRadius: "6px",
    textTransform: "capitalize",
  }),
  singleValue: (provided) => ({
    ...provided,
    textTransform: "capitalize",
  }),
  option: (provided) => ({
    ...provided,
    textTransform: "capitalize",
  }),
};

/**
 * Dropdowns Section Component
 * Displays and allows editing of dropdown selections with creatable options
 */
const DropdownsSection = ({
  selectedAccount,
  selectedPlatform,
  selectedStatus,
  selectedCustomerAsks,
  isEditMode,
  onAccountChange,
  onPlatformChange,
  onStatusChange,
  onCustomerAsksChange,
}) => {
  const [accountOptions, setAccountOptions] = useState([]);
  const [platformOptions, setPlatformOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [customerAsksOptions, setCustomerAsksOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState({
    account: false,
    platform: false,
    status: false,
    customerAsks: false,
  });

  // Modal state
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    type: "",
    options: [],
    setOptions: null,
  });

  // Fetch options on component mount
  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    setIsLoading(true);
    const result = await getReturnOrderOptionsGrouped();

    if (result.success && result.options) {
      const { account, platform, status, customerAsks } = result.options;

      setAccountOptions(formatOptions(account));
      setPlatformOptions(formatOptions(platform));
      setStatusOptions(formatOptions(status));
      setCustomerAsksOptions(formatOptions(customerAsks));
    }
    setIsLoading(false);
  };

  // Format options for react-select
  const formatOptions = (options) => {
    return (
      options?.map((opt) => ({
        value: opt.name.toLowerCase().replace(/\s+/g, ""),
        label: opt.name,
        _id: opt._id,
      })) || []
    );
  };

  // Handle creating new option
  const handleCreateOption = async (
    inputValue,
    type,
    setOptions,
    currentOptions,
    onChange
  ) => {
    setIsCreating((prev) => ({ ...prev, [type]: true }));

    const result = await createReturnOrderOption(inputValue, type);

    if (result.success && result.option) {
      const newOption = {
        value: result.option.name.toLowerCase().replace(/\s+/g, ""),
        label: result.option.name,
        _id: result.option._id,
      };

      setOptions((prev) => [...prev, newOption]);
      onChange(newOption);
      toast.success(`"${inputValue}" added successfully`);
    } else {
      toast.error(result.error || "Failed to create option");
    }

    setIsCreating((prev) => ({ ...prev, [type]: false }));
  };

  // Open management modal
  const openManageModal = (title, type, options, setOptions) => {
    setModalConfig({
      isOpen: true,
      title,
      type,
      options,
      setOptions,
    });
  };

  // Close management modal
  const closeManageModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  // Handle options update from modal
  const handleOptionsUpdate = (updatedOptions) => {
    if (modalConfig.setOptions) {
      modalConfig.setOptions(updatedOptions);
    }
  };

  // Dropdown configuration
  const dropdownConfigs = [
    {
      key: "account",
      title: "Account",
      icon: <BuildingStorefrontIcon className="h-4 w-4 text-primary" />,
      options: accountOptions,
      setOptions: setAccountOptions,
      selected: selectedAccount,
      onChange: onAccountChange,
      isCreating: isCreating.account,
    },
    {
      key: "platform",
      title: "Platform",
      icon: <BuildingStorefrontIcon className="h-4 w-4 text-primary" />,
      options: platformOptions,
      setOptions: setPlatformOptions,
      selected: selectedPlatform,
      onChange: onPlatformChange,
      isCreating: isCreating.platform,
    },
    {
      key: "status",
      title: "Status",
      icon: <ClipboardDocumentCheckIcon className="h-4 w-4 text-primary" />,
      options: statusOptions,
      setOptions: setStatusOptions,
      selected: selectedStatus,
      onChange: onStatusChange,
      isCreating: isCreating.status,
    },
    {
      key: "customerAsks",
      title: "Customer Asks",
      icon: <QuestionMarkCircleIcon className="h-4 w-4 text-primary" />,
      options: customerAsksOptions,
      setOptions: setCustomerAsksOptions,
      selected: selectedCustomerAsks,
      onChange: onCustomerAsksChange,
      isCreating: isCreating.customerAsks,
    },
  ];

  return (
    <>
      <div
        className={`grid grid-cols-1 gap-3 ${
          isEditMode ? "md:grid-cols-1" : "md:grid-cols-1"
        }`}
      >
        {dropdownConfigs.map((config) => (
          <div
            key={config.key}
            className={isEditMode ? "" : "flex items-center justify-between"}
          >
            <div
              className={`flex items-center justify-between ${
                isEditMode ? "mb-1.5" : ""
              }`}
            >
              <label className="text-xs font-medium text-gray-900 flex items-center gap-1.5">
                {config.icon}
                {config.title}
              </label>
              {isEditMode && (
                <button
                  type="button"
                  onClick={() =>
                    openManageModal(
                      config.title,
                      config.key,
                      config.options,
                      config.setOptions
                    )
                  }
                  className="p-0.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                  title={`Manage ${config.title} Options`}
                >
                  <Cog6ToothIcon className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {isEditMode ? (
              <CreatableSelect
                isClearable
                isLoading={isLoading || config.isCreating}
                options={config.options}
                value={config.selected}
                onChange={config.onChange}
                onCreateOption={(inputValue) =>
                  handleCreateOption(
                    inputValue,
                    config.key,
                    config.setOptions,
                    config.options,
                    config.onChange
                  )
                }
                styles={{
                  ...selectStyles,
                  control: (provided) => ({
                    ...provided,
                    minHeight: "32px",
                    fontSize: "12px",
                  }),
                  placeholder: (provided) => ({
                    ...provided,
                    fontSize: "12px",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    fontSize: "12px",
                  }),
                }}
                placeholder="Select or create..."
                formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              />
            ) : (
              <p className="text-xs text-gray-700">
                {config.selected?.label || `No ${config.title} Selected`}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Option Management Modal */}
      <OptionManagementModal
        isOpen={modalConfig.isOpen}
        onClose={closeManageModal}
        title={modalConfig.title}
        type={modalConfig.type}
        options={modalConfig.options}
        onOptionsUpdate={handleOptionsUpdate}
      />
    </>
  );
};

DropdownsSection.propTypes = {
  selectedAccount: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  selectedPlatform: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  selectedStatus: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  selectedCustomerAsks: PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  }),
  isEditMode: PropTypes.bool.isRequired,
  onAccountChange: PropTypes.func.isRequired,
  onPlatformChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onCustomerAsksChange: PropTypes.func.isRequired,
};

export default DropdownsSection;
