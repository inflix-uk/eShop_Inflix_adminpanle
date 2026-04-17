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
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [availableSubCategories, setAvailableSubCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    useEffect(() => {
        const subCategories = selectedCategories.flatMap(category =>
            categories.find(cat => cat.name === category.value)?.subCategory || []
        );
        const uniqueSubCategories = [...new Set(subCategories)];
        const subCategoryOptions = uniqueSubCategories.map(subCat => ({ value: subCat, label: subCat }));
        setAvailableSubCategories(subCategoryOptions);
    }, [selectedCategories, categories]);
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

    useEffect(() => {
        setProductCategory(selectedCategories.map(option => option.value));
    }, [selectedCategories, setProductCategory]);

    useEffect(() => {
        setProductTag(selectedTags.map(option => option.value));
    }, [selectedTags, setProductTag]);

    const handleCategoryChange = (selectedOptions) => {
        setSelectedCategories(selectedOptions);

        const remainingSubCategories = selectedSubCategories.filter(subCat => {
            const parentCategory = categories.find(category =>
                category.subCategory.includes(subCat.value)
            );
            return parentCategory && selectedOptions.some(option => option.value === parentCategory.name);
        });

        setSelectedSubCategories(remainingSubCategories);

        const subCategories = selectedOptions.flatMap(category =>
            categories.find(cat => cat.name === category.value)?.subCategory || []
        );
        const uniqueSubCategories = [...new Set(subCategories)];
        const subCategoryOptions = uniqueSubCategories.map(subCat => ({ value: subCat, label: subCat }));
        setAvailableSubCategories(subCategoryOptions);

        if (selectedOptions.length === 0) {
            setSelectedSubCategories([]);
        }
    };

    const handleSubCategoryChange = (selectedOptions) => {
        setSelectedSubCategories(selectedOptions);

        const selectedSubCategoryValues = selectedOptions.map(option => option.value);
        console.log('Selected Subcategories Values:', selectedSubCategoryValues);

        const updatedCategories = categories.map(category => {
            const matchingSubCategories = category.subCategory.filter(subCat =>
                selectedSubCategoryValues.includes(subCat)
            );
            console.log(`Category: ${category.name}, Matching Subcategories:`, matchingSubCategories);

            return {
                ...category,
                selectedSubCategories: matchingSubCategories
            };
        }).filter(category => category.selectedSubCategories.length > 0);

        setSelectedCategories(updatedCategories.map(cat => ({ value: cat.name, label: cat.name })));

        const categoryData = updatedCategories.reduce((acc, cat) => {
            acc[cat.name] = cat.selectedSubCategories;
            return acc;
        }, {});

        console.log('Category Data for FormData:', categoryData);
        setProductSubCategory(categoryData);
    };

    useEffect(() => {
        console.log('Updated Selected Categories:', selectedCategories);
    }, [selectedCategories]);

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
                                        isMulti
                                        className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 aa"
                                        onChange={handleCategoryChange}
                                        value={selectedCategories}
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
    productSubCategory: PropTypes.array.isRequired,
    setProductSubCategory: PropTypes.func.isRequired,
    setProductCondition: PropTypes.func.isRequired,
    setProductBrand: PropTypes.func.isRequired,
    setProductTag: PropTypes.func.isRequired,
    tags: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    condition: PropTypes.array.isRequired,
    brands: PropTypes.array.isRequired,
}
