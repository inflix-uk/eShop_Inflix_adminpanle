import  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { toast } from 'react-toastify';
import {
  buildMainCategorySelectOptions,
  findMainCategorySelectOption,
} from '../../utils/googleProductCategoryExport';

/** Parent group headers + indented sub-options in Main Category select */
const mainCategorySelectStyles = {
  group: (base) => ({
    ...base,
    padding: 0,
  }),
  groupHeading: (base) => ({
    ...base,
    fontSize: "0.8125rem",
    fontWeight: 600,
    color: "#1e40af",
    backgroundColor: "#eff6ff",
    borderTop: "1px solid #dbeafe",
    borderBottom: "1px solid #93c5fd",
    padding: "8px 12px",
    marginTop: 8,
    marginBottom: 4,
    textTransform: "none",
    letterSpacing: "0.01em",
  }),
  option: (base, { data }) => ({
    ...base,
    paddingLeft: data?.subcategoryName ? "1.75rem" : "0.75rem",
    fontSize: "0.875rem",
  }),
};

export default function ProductEditForm({
  product,
  setProduct,
  productUrl, setProductUrl,
  conditions,
  selectedConditions,
  handleConditionChange,
  isCustomCondition = false,
  onCustomConditionChange = () => {},
  tags,
  selectedTags,
  handleTagsChange,
  productApi,
  brands,
}) {
  const [categories, setCategories] = useState([]);
  const [mainCategoryOptions, setMainCategoryOptions] = useState([]);
  const [storeCategories, setStoreCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const brandOptions = brands?.map((brand) => ({
    value: brand.name,
    label: brand.name,
  })) || [];

  useEffect(() => {
    if (product?.brand && brandOptions.length > 0) {
      const brandOption = brandOptions.find(b => b.value === product.brand);
      if (brandOption) {
        setSelectedBrand(brandOption);
      }
    }
  }, [product?.brand, brandOptions.length]);

  const handleBrandChange = (selectedOption) => {
    setSelectedBrand(selectedOption);
    setProduct(prevProduct => ({
      ...prevProduct,
      brand: selectedOption ? selectedOption.value : null,
    }));
  };

  useEffect(() => {
    if (product && product.name) {
      generateProductURL(product.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.name]);

  useEffect(() => {
    if (productApi) {
      getCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productApi]);

  useEffect(() => {
    if (categories.length > 0 && product) {
      initializeForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    categories.length,
    mainCategoryOptions.length,
    product?.category,
    product?.subCategory,
    product?.mainCategory,
  ]);

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await productApi.getCategories();
      if (response.data.status === 201) {
        const filteredCategories = response.data.productCategories.filter(
          (category) => category.isPublish
        );
        setStoreCategories(filteredCategories);
        setMainCategoryOptions(buildMainCategorySelectOptions(filteredCategories));
        setCategories(filteredCategories.map(cat => ({
          label: cat.name,
          value: cat.name,
          googleCategoryFullPath: cat.googleCategoryFullPath || "",
          subCategory: (cat.subCategory || []).map(subCat => ({
            label: subCat,
            value: subCat,
            category: cat.name,
          })),
        })));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const initializeForm = () => {
    if (product.mainCategory && mainCategoryOptions.length > 0) {
      setSelectedMainCategory(
        findMainCategorySelectOption(mainCategoryOptions, product.mainCategory)
      );
    } else {
      setSelectedMainCategory(null);
    }

    if (product.category) {
      const initialCategories = product.category.split(',').map(cat => ({
        label: cat,
        value: cat,
      }));

      setSelectedCategories(initialCategories);

      const newSubCategories = initialCategories.flatMap(option =>
        categories.find(cat => cat.value === option.value)?.subCategory || []
      );
      setSubCategories(newSubCategories);
    }

    if (product.subCategory) {
      let parsedSubCategories;
      try {
        parsedSubCategories = JSON.parse(product.subCategory);
      } catch (error) {
        console.error('Error parsing subCategory JSON:', error);
        parsedSubCategories = {};
      }

      const initialSubCategories = Object.entries(parsedSubCategories).flatMap(
        ([category, subCats]) =>
          subCats.map(subCat => ({
            label: subCat,
            value: subCat,
            category: category,
          }))
      );

      setSelectedSubCategories(initialSubCategories);
    }
  };

  const handleMainCategoryChange = (selectedOption) => {
    setSelectedMainCategory(selectedOption);
    setProduct((prevProduct) => ({
      ...prevProduct,
      mainCategory: selectedOption ? selectedOption.value : null,
    }));
  };

  const handleCategoryChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions || []);

    const updatedCategories = (selectedOptions || []).map(option => option.value).join(',');
    setProduct(prevProduct => ({
      ...prevProduct,
      category: updatedCategories,
    }));

    const removedCategories = selectedCategories.filter(
      (cat) => !(selectedOptions || []).some((selected) => selected.value === cat.value)
    );

    const updatedSelectedSubCategories = selectedSubCategories.filter(
      (subCat) => !removedCategories.some((cat) => cat.value === subCat.category)
    );

    setSelectedSubCategories(updatedSelectedSubCategories);

    let updatedSubCategoryObject = {};
    try {
      updatedSubCategoryObject = product.subCategory ? JSON.parse(product.subCategory) : {};
    } catch {
      updatedSubCategoryObject = {};
    }
    removedCategories.forEach((cat) => {
      delete updatedSubCategoryObject[cat.value];
    });

    const updatedSubCategoryString = JSON.stringify(updatedSubCategoryObject);

    setProduct(prevProduct => ({
      ...prevProduct,
      subCategory: updatedSubCategoryString,
    }));

    const newSubCategories = (selectedOptions || []).flatMap(option =>
      categories.find(cat => cat.value === option.value)?.subCategory || []
    );

    setSubCategories(newSubCategories);
  };

  const handleSubCategoryChange = (selectedOptions) => {
    setSelectedSubCategories(selectedOptions || []);

    const groupedSubCategories = (selectedOptions || []).reduce((acc, subCat) => {
      if (!acc[subCat.category]) {
        acc[subCat.category] = [];
      }
      acc[subCat.category].push(subCat.value);
      return acc;
    }, {});

    const updatedSubCategoryString = JSON.stringify(groupedSubCategories);

    setProduct(prevProduct => ({
      ...prevProduct,
      subCategory: updatedSubCategoryString,
    }));
  };

  const generateProductURL = (name) => {
    if (!name) return;

    const sanitizedName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9. ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/(\d+)\.(\d+)/g, '$1.$2');

    const cleanedName = sanitizedName.replace(/[-\s]+$/, '');

    setProductUrl(cleanedName);
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      name: newName,
    }));
    generateProductURL(newName);
  };

  return (
    <>
      <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-8">
            <div className="">
              <label
                htmlFor="product-name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="product-name"
                  id="product-name"
                  autoComplete="given-name"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  value={product?.name || ''}
                  onChange={handleNameChange}
                />
                <input type="hidden" name="product-url" value={productUrl} />
                <p>Generated Url:{productUrl}</p>
              </div>
            </div>

            <div className="">
              <label
                htmlFor="main-category"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Main Category
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Pick a store category or subcategory for Google Merchant export. Google taxonomy
                is set on the parent category in Product Central.
              </p>
              <div className="mt-2">
                <Select
                  id="main-category"
                  name="main-category"
                  options={mainCategoryOptions}
                  isMulti={false}
                  isClearable
                  value={selectedMainCategory}
                  className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  onChange={handleMainCategoryChange}
                  isLoading={isLoadingCategories}
                  placeholder={
                    isLoadingCategories ? "Loading categories..." : "Select category or subcategory"
                  }
                  styles={mainCategorySelectStyles}
                  formatGroupLabel={(group) => (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                      {group.label}
                    </span>
                  )}
                />
              </div>
              {selectedMainCategory ? (
                <p className="mt-2 text-xs text-gray-600">
                  {selectedMainCategory.parentName &&
                  selectedMainCategory.subcategoryName ? (
                    <span className="block text-gray-500">
                      Store: {selectedMainCategory.parentName} ›{" "}
                      {selectedMainCategory.subcategoryName}
                    </span>
                  ) : null}
                  {selectedMainCategory.googleCategoryFullPath
                    ? `Google path: ${String(selectedMainCategory.googleCategoryFullPath).replace(/ > /g, " / ")}`
                    : "No Google category mapped on the parent store category yet."}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="">
                <label
                  htmlFor="categories"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Categories
                </label>
                <div className="mt-2">
                  <Select
                    id="categories"
                    name="categories"
                    options={categories}
                    isMulti
                    value={selectedCategories}
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                    onChange={handleCategoryChange}
                    isLoading={isLoadingCategories}
                    placeholder={isLoadingCategories ? "Loading categories..." : "Select categories"}
                  />
                </div>
              </div>

              <div className="">
                <label
                  htmlFor="sub-categories"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Sub Categories
                </label>
                <div className="mt-2">
                  <Select
                    id="sub-categories"
                    name="sub-categories"
                    options={subCategories}
                    isMulti
                    value={selectedSubCategories}
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                    onChange={handleSubCategoryChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="">
                <label
                  htmlFor="condition"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Condition
                </label>
                <div className="mt-2">
                  <Select
                    id="condition"
                    name="condition"
                    options={conditions}
                    value={selectedConditions}
                    onChange={handleConditionChange}
                    isClearable
                    placeholder="Select condition"
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                  />
                </div>
                {isCustomCondition ? (
                  <div className="mt-3">
                    <label
                      htmlFor="condition-custom-text"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Custom condition text
                    </label>
                    <input
                      id="condition-custom-text"
                      name="condition-custom-text"
                      type="text"
                      value={product?.condition ?? ""}
                      onChange={(e) => onCustomConditionChange(e.target.value)}
                      placeholder="e.g. Open box — tested, 99% battery health"
                      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This text is saved as the product condition instead of a
                      preset from the list.
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="">
                <label
                  htmlFor="brand"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Brand
                </label>
                <div className="mt-2">
                  <Select
                    id="brand"
                    name="brand"
                    options={brandOptions}
                    value={selectedBrand}
                    onChange={handleBrandChange}
                    isClearable
                    className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                    placeholder="Select brand"
                  />
                </div>
              </div>
            </div>

            <div className="">
              <label
                htmlFor="tags"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Tags
              </label>
              <Select
                id="tags"
                name="tags"
                isMulti
                options={tags}
                value={selectedTags}
                onChange={handleTagsChange}
                className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
              />
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

ProductEditForm.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
  productUrl: PropTypes.string,
  setProductUrl: PropTypes.func.isRequired,
  conditions: PropTypes.array.isRequired,
  selectedConditions: PropTypes.object,
  handleConditionChange: PropTypes.func.isRequired,
  isCustomCondition: PropTypes.bool,
  onCustomConditionChange: PropTypes.func,
  tags: PropTypes.array.isRequired,
  selectedTags: PropTypes.array,
  handleTagsChange: PropTypes.func.isRequired,
  productApi: PropTypes.object.isRequired,
  brands: PropTypes.array,
};
