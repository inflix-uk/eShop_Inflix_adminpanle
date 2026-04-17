import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X, Search } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [totalProductsCount, setTotalProductsCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);

    useEffect(() => {
        if (searchQuery.trim().length >= 3) {
            const delayDebounceFn = setTimeout(() => {
                fetchProducts(searchQuery);
            }, 500);

            return () => clearTimeout(delayDebounceFn);
        } else {
            setProducts([]);
            setTotalProductsCount(0);
        }
    }, [searchQuery]);

    const fetchProducts = async (searchname) => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}get/all/product/adminpage/v2`, {
                params: { searchname }
            });
            console.log('Search query:', searchname);
            if (response.data.status === 201 || response.data.products) {
                setProducts(response.data.products || response.data.data || []);
                setTotalProductsCount(response.data.totalProductsCount || 0);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async (productId) => {
        setLoadingVariants(true);
        try {
            const response = await axios.get(`${BACKEND_URL}get/product/variantValues/${productId}`);
            console.log('Variants response:', response.data);
            if (response.data) {
                setVariants(response.data.variantValues || response.data.variants || response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching variants:', error);
            toast.error('Failed to fetch product variants');
        } finally {
            setLoadingVariants(false);
        }
    };

    const handleProductClick = async (product) => {
        // Check if product has variants based on productType
        const isVariantProduct = product.productType?.type === 'variant';

        if (isVariantProduct) {
            setSelectedProduct(product);
            await fetchVariants(product._id);
        } else {
            // Add single product directly
            // For single products, price is in variantValues[0]
            const salePrice = product.variantValues?.[0]?.salePrice || product.variantValues?.[0]?.Price || 0;

            const productToAdd = {
                _id: product._id,
                productId: product._id,
                name: product.name,
                productName: product.name,
                salePrice: parseFloat(salePrice),
                qty: 1,
                productthumbnail: product.thumbnail_image,
                variantImages: product.Gallery_Images || [],
            };
            onAddProduct(productToAdd);
            handleClose();
        }
    };

    const handleVariantSelect = (variant) => {
        setSelectedVariant(variant);
    };

    const handleAddVariant = () => {
        if (!selectedVariant) {
            toast.error('Please select a variant');
            return;
        }

        const productToAdd = {
            _id: selectedVariant._id || selectedProduct._id,
            productId: selectedProduct._id,
            variantId: selectedVariant._id,
            name: selectedVariant.name,
            productName: selectedProduct.name,
            salePrice: parseFloat(selectedVariant.salePrice) || selectedVariant.Price || selectedProduct.salePrice || 0,
            qty: 1,
            productthumbnail: selectedVariant.metaImage || selectedProduct.thumbnail_image,
            variantImages: selectedVariant.variantImages || selectedProduct.Gallery_Images || [],
        };

        onAddProduct(productToAdd);
        handleClose();
    };

    const handleClose = () => {
        setSearchQuery('');
        setProducts([]);
        setTotalProductsCount(0);
        setSelectedProduct(null);
        setVariants([]);
        setSelectedVariant(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {selectedProduct ? 'Select Variant' : 'Add Product to Order'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {!selectedProduct ? (
                        <>
                            {/* Search Input */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                </div>
                                {searchQuery.trim().length >= 3 && totalProductsCount > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Found <span className="font-semibold">{totalProductsCount}</span> product{totalProductsCount !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            {/* Products List */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-600">Loading products...</p>
                                </div>
                            ) : searchQuery.trim().length < 3 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">Type at least 3 characters to search products</p>
                                </div>
                            ) : products.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No products found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map((product) => {
                                        const imageUrl = product.thumbnail_image?.path
                                            ? `${BACKEND_URL}${product.thumbnail_image.path}`
                                            : product.Gallery_Images?.[0]?.path
                                            ? `${BACKEND_URL}${product.Gallery_Images[0].path}`
                                            : '/placeholder-image.png';

                                        const productType = product.productType?.type || 'single';

                                        // Extract price for single products
                                        const price = product.variantValues?.[0]?.Price;
                                        const salePrice = product.variantValues?.[0]?.salePrice;

                                        return (
                                            <div
                                                key={product._id}
                                                onClick={() => handleProductClick(product)}
                                                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition cursor-pointer"
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {product.brand} • {product.condition}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                                                            productType === 'variant'
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                            {productType === 'variant' ? 'Variant' : 'Single'}
                                                        </span>
                                                    </div>

                                                    {/* Display price for single products */}
                                                    {productType === 'single' && (price || salePrice) && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {price && salePrice && parseFloat(salePrice) < parseFloat(price) ? (
                                                                <>
                                                                    <span className="text-sm text-gray-400 line-through">
                                                                        £{price}
                                                                    </span>
                                                                    <span className="text-lg font-bold text-blue-600">
                                                                        £{salePrice}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-lg font-bold text-blue-600">
                                                                    £{salePrice || price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Variant Selection */}
                            <button
                                onClick={() => {
                                    setSelectedProduct(null);
                                    setVariants([]);
                                    setSelectedVariant(null);
                                }}
                                className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ← Back to Products
                            </button>

                            {loadingVariants ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-600">Loading variants...</p>
                                </div>
                            ) : variants.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">No variants found for this product</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold mb-4">
                                        Select variant for: {selectedProduct.name}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {variants.map((variant, index) => {
                                            const variantImageUrl = variant.metaImage?.path
                                                ? `${BACKEND_URL}${variant.metaImage.path}`
                                                : variant.variantImages?.[0]?.path
                                                ? `${BACKEND_URL}${variant.variantImages[0].path}`
                                                : selectedProduct.thumbnail_image?.path
                                                ? `${BACKEND_URL}${selectedProduct.thumbnail_image.path}`
                                                : '/placeholder-image.png';

                                            // Parse variant name to extract details
                                            const variantParts = variant.name.split('-');
                                            const condition = variantParts[0] || '';
                                            const colorMatch = variant.name.match(/-(.*?)\s*\(/);
                                            const color = colorMatch ? colorMatch[1] : '';
                                            const storageMatch = variant.name.match(/-(\d+[GT]B)$/);
                                            const storage = storageMatch ? storageMatch[1] : '';

                                            return (
                                                <div
                                                    key={variant._id || index}
                                                    onClick={() => handleVariantSelect(variant)}
                                                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition ${
                                                        selectedVariant?._id === variant._id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-blue-300'
                                                    }`}
                                                >
                                                    <img
                                                        src={variantImageUrl}
                                                        alt={variant.name}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-sm">
                                                            {variant.name}
                                                        </h4>
                                                        {color && (
                                                            <p className="text-xs text-gray-600 mt-1">Color: {color}</p>
                                                        )}
                                                        {storage && (
                                                            <p className="text-xs text-gray-600">Storage: {storage}</p>
                                                        )}
                                                        {variant.SKU && (
                                                            <p className="text-xs text-gray-500">SKU: {variant.SKU}</p>
                                                        )}
                                                        <span className="text-lg font-bold text-blue-600 mt-2 block">
                                                            £{variant.salePrice || variant.Price || 0}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Add Variant Button */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            onClick={handleAddVariant}
                                            disabled={!selectedVariant}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                                        >
                                            Add to Order
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;
