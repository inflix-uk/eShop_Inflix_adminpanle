import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';

export default function ProductForm({
    productName,
    setProductName,
    productUrl,
    setProductUrl,
    setProductCategory,
    productSubCategory,
    setProductSubCategory,
    setProductCondition,
    setProductBrand,
    setProductTag,
    tags,
    categories,
    condition,
    brands,
}) {
    // A product belongs to a single category — the backend `category` field is one
    // String, indexed and filtered as a single value. A multi-select here produced
    // a "A,B" string that matched nothing downstream.
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        const subCats = selectedCategory
            ? (categories.find(cat => cat.name === selectedCategory.value)?.subCategory || [])
            : [];
        const uniqueSubCategories = [...new Set(subCats)];
        setAvailableSubCategories(
            uniqueSubCategories.map(subCat => ({ value: subCat, label: subCat }))
        );
    }, [selectedCategory, categories]);
    const [selectedCondition, setSelectedCondition] = useState(null);
    const [selectedBrand, setSelectedBrand] = useState(null);

    useEffect(() => {
        setProductCondition(selectedCondition ? selectedCondition.value : null);
    }, [selectedCondition, setProductCondition]);

    useEffect(() => {
        setProductBrand(selectedBrand ? selectedBrand.value : null);
    }, [selectedBrand, setProductBrand]);

    const conditionOptions = condition.map((condition) => ({
        value: condition.name,
        label: condition.name,
    }));

    const brandOptions = brands?.map((brand) => ({
        value: brand.name,
        label: brand.name,
    })) || [];

    // Handle product name change and generate URL
    const handleProductNameChange = (e) => {
        const name = e.target.value;
        setProductName(name);
        generateProductURL(name);
    };

    // Handle product condition change
    const handleConditionChange = (selectedOption) => {
        setSelectedCondition(selectedOption);
    };

    // Handle product brand change
    const handleBrandChange = (selectedOption) => {
        setSelectedBrand(selectedOption);
    };

    // Submitted category is a single value to match the backend `category` String.
    useEffect(() => {
        setProductCategory(selectedCategory ? selectedCategory.value : "");
    }, [selectedCategory, setProductCategory]);

    useEffect(() => {
        setProductTag(selectedTags.map(option => option.value));
    }, [selectedTags, setProductTag]);

    // subCategory is stored as { Category: [Sub, ...] }. With one category the map
    // has a single key; empty when either the category or the subcategory list is.
    const syncSubCategoryPayload = (category, subCats) => {
        if (!category || subCats.length === 0) {
            setProductSubCategory({});
            return;
        }
        setProductSubCategory({ [category.value]: subCats.map((s) => s.value) });
    };

    const handleCategoryChange = (selectedOption) => {
        setSelectedCategory(selectedOption);

        // Drop any chosen subcategories that don't belong to the new category, so
        // the saved payload never carries subcategories from a category it lost.
        const allowed = selectedOption
            ? (categories.find(cat => cat.name === selectedOption.value)?.subCategory || [])
            : [];
        const remainingSubCategories = selectedSubCategories.filter(subCat =>
            allowed.includes(subCat.value)
        );
        setSelectedSubCategories(remainingSubCategories);
        syncSubCategoryPayload(selectedOption, remainingSubCategories);
    };

    const handleSubCategoryChange = (selectedOptions) => {
        const subCats = selectedOptions || [];
        setSelectedSubCategories(subCats);
        syncSubCategoryPayload(selectedCategory, subCats);
    };

    useEffect(() => {
        console.log('Updated Selected Category:', selectedCategory);
    }, [selectedCategory]);

    useEffect(() => {
        console.log('Updated Product Subcategories:', productSubCategory);
    }, [productSubCategory]);

    const handleTagChange = (selectedOptions) => {
        setSelectedTags(selectedOptions);
    };

    const options = categories.map((category) => ({
        value: category.name,
        label: category.name,
    }));

    const tagOptions = tags.map((tag) => ({
        value: tag.name,
        label: tag.name,
    }));

    const generateProductURL = (name) => {
        if (!name) return;
        const sanitizedName = name
            .toLowerCase()
            .replace(/[^a-z0-9. ]/g, '')
            .replace(/\s+/g, '-')
            .replace(/(\d+)\.(\d+)/g, '$1.$2')
            .replace(/-+$/g, '');
        setProductUrl(sanitizedName);
    };

    return (
        <>
            <form className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
                <div className="px-4 py-6 sm:p-8">
                    <div className="">
                        <label
                            htmlFor="first-name"
                            className="block text-sm font-medium leading-6 text-gray-900"
                        >
                            Name
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="first-name"
                                id="first-name"
                                autoComplete="given-name"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                value={productName}
                                onChange={handleProductNameChange}
                            />
                            <input
                                type="hidden"
                                name="product-url"
                                value={productUrl}
                            />
                            <p>Generated URL: {productUrl}</p>
                        </div>
                    </div>
                    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-1">
                        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-1 mt-4">
                            <div className="w-full">
                                <label htmlFor="categories" className="block text-sm font-medium leading-6 text-gray-900">
                                    Categories
                                </label>
                                <div className="mt-2 w-full">
                                    <Select
                                        id="categories"
                                        name="categories"
                                        options={options}
                                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                                        onChange={handleCategoryChange}
                                        value={selectedCategory}
                                        placeholder="Select a category..."
                                        isClearable
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label htmlFor="subCategories" className="block text-sm font-medium leading-6 text-gray-900">
                                    Subcategories
                                </label>
                                <div className="mt-2 w-full">
                                    <Select
                                        id="subCategories"
                                        name="subCategories"
                                        options={availableSubCategories}
                                        isMulti
                                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                                        onChange={handleSubCategoryChange}
                                        value={selectedSubCategories}
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="conditions"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Condition
                                </label>
                                <div className="mt-2 w-full">
                                    <Select
                                        id="conditions"
                                        name="conditions"
                                        options={conditionOptions}
                                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                                        onChange={handleConditionChange}
                                        value={selectedCondition}
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="brands"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Brand
                                </label>
                                <div className="mt-2 w-full">
                                    <Select
                                        id="brands"
                                        name="brands"
                                        options={brandOptions}
                                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                                        onChange={handleBrandChange}
                                        value={selectedBrand}
                                        placeholder="Select a brand..."
                                        isClearable
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label
                                    htmlFor="tags"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Tags
                                </label>
                                <div className="mt-2 w-full">
                                    <Select
                                        id="tags"
                                        name="tags"
                                        options={tagOptions}
                                        isMulti
                                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                                        onChange={handleTagChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

ProductForm.propTypes = {
    productName: PropTypes.string.isRequired,
    setProductName: PropTypes.func.isRequired,
    productUrl: PropTypes.string.isRequired,
    setProductUrl: PropTypes.func.isRequired,
    setProductCategory: PropTypes.func.isRequired,
    productSubCategory: PropTypes.object.isRequired,
    setProductSubCategory: PropTypes.func.isRequired,
    setProductCondition: PropTypes.func.isRequired,
    setProductBrand: PropTypes.func.isRequired,
    setProductTag: PropTypes.func.isRequired,
    tags: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    condition: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
}
