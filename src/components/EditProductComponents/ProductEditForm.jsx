import  { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { toast } from 'react-toastify';

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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Brand options
  const brandOptions = brands?.map((brand) => ({
    value: brand.name,
    label: brand.name,
  })) || [];

  // Initialize brand when product loads
  useEffect(() => {
    if (product?.brand && brandOptions.length > 0) {
      const brandOption = brandOptions.find(b => b.value === product.brand);
      if (brandOption) {
        setSelectedBrand(brandOption);
      }
    }
  }, [product?.brand, brandOptions.length]);

  // Handle brand change
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
    // Fetch categories when component mounts
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
  }, [categories.length, product?.category, product?.subCategory]);

  const getCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const response = await productApi.getCategories();
      if (response.data.status === 201) {
        const filteredCategories = response.data.productCategories.filter(
          (category) => category.isPublish
        );
        setCategories(filteredCategories.map(cat => ({
          label: cat.name,
          value: cat.name,
          subCategory: cat.subCategory.map(subCat => ({
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
        parsedSubCategories = {}; // Default to an empty object if parsing fails
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

  const handleCategoryChange = (selectedOptions) => {
    // Update selected categories
    setSelectedCategories(selectedOptions);

    // Update the product state with the new categories
    const updatedCategories = selectedOptions.map(option => option.value).join(',');
    setProduct(prevProduct => ({
      ...prevProduct,
      category: updatedCategories,
    }));

    // Determine which categories were removed
    const removedCategories = selectedCategories.filter(
      (cat) => !selectedOptions.some((selected) => selected.value === cat.value)
    );

    // Remove subcategories associated with the removed categories from selectedSubCategories
    const updatedSelectedSubCategories = selectedSubCategories.filter(
      (subCat) => !removedCategories.some((cat) => cat.value === subCat.category)
    );

    setSelectedSubCategories(updatedSelectedSubCategories);

    // Remove the subcategories of the removed categories from product.subCategory
    const updatedSubCategoryObject = { ...JSON.parse(product.subCategory) };
    removedCategories.forEach((cat) => {
      delete updatedSubCategoryObject[cat.value];
    });

    // Convert the updated subcategory object back to a JSON string
    const updatedSubCategoryString = JSON.stringify(updatedSubCategoryObject);

    // Update the product state with the new subCategory
    setProduct(prevProduct => ({
      ...prevProduct,
      subCategory: updatedSubCategoryString,
    }));

    // Filter and add new subcategories based on the selected categories
    const newSubCategories = selectedOptions.flatMap(option =>
      categories.find(cat => cat.value === option.value)?.subCategory || []
    );

    setSubCategories(newSubCategories);
  };

  const handleSubCategoryChange = (selectedOptions) => {
    setSelectedSubCategories(selectedOptions);

    // Group the selected subcategories by their categories
    const groupedSubCategories = selectedOptions.reduce((acc, subCat) => {
      if (!acc[subCat.category]) {
        acc[subCat.category] = [];
      }
      acc[subCat.category].push(subCat.value);
      return acc;
    }, {});

    // Update the product.subCategory state
    const updatedSubCategoryString = JSON.stringify(groupedSubCategories);

    setProduct(prevProduct => ({
      ...prevProduct,
      subCategory: updatedSubCategoryString,
    }));
  };
  const generateProductURL = (name) => {
    if (!name) return; // Ensure the name is defined before generating the URL

    // Sanitize the product name
    const sanitizedName = name
      .toLowerCase()
      .trim() // Remove leading and trailing spaces
      .replace(/[^a-z0-9. ]/g, '') // Remove special characters except dots for versions
      .replace(/\s+/g, '-') // Replace internal spaces with dashes
      .replace(/(\d+)\.(\d+)/g, '$1.$2'); // Keep version numbers like 10.9

    // Remove unwanted spaces or hyphens at the end of the sanitized name
    const cleanedName = sanitizedName.replace(/[-\s]+$/, '');

    // Set the product URL
    setProductUrl(cleanedName);
  };



  const handleNameChange = (e) => {
    const newName = e.target.value;
    setProduct((prevProduct) => ({
      ...prevProduct,
      name: newName,
    }));
    generateProductURL(newName); // Update URL based on new name
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
                  onChange={handleNameChange} // Updated to handle name changes
                />
                <input type="hidden" name="product-url" value={productUrl} />
                <p>Generated Url:{productUrl}</p>
              </div>
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
