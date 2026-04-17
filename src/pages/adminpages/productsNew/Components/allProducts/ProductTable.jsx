import PropTypes from "prop-types";
import ProductRow from "./ProductRow";
import ProductCard from "./ProductCard";

const ProductTable = ({
  products,
  auth,
  onFeaturedChange,
  onStatusChange,
  onDelete,
  onDuplicate,
  onViewVariants,
}) => {
  return (
    <>
      {/* Mobile Card View - visible on small screens */}
      <div className="block md:hidden p-4">
        {products.map((product, index) => (
          <ProductCard
            key={product._id}
            product={product}
            index={index}
            auth={auth}
            onFeaturedChange={onFeaturedChange}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onViewVariants={onViewVariants}
          />
        ))}
      </div>

      {/* Desktop Table View - visible on medium screens and up */}
      <div className="hidden md:block overflow-x-auto scrollbar-thin scrollbar-webkit">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-black uppercase border-b border-gray-200">
            <tr>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                Name
              </th>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                Category
              </th>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                Variants
              </th>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                Condition
              </th>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                Featured
              </th>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                Published
              </th>
              <th scope="col" className="px-4 lg:px-6 py-5 font-semibold">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody className="text-left bg-white">
            {products.map((product, index) => (
              <ProductRow
                key={product._id}
                product={product}
                index={index}
                auth={auth}
                onFeaturedChange={onFeaturedChange}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onViewVariants={onViewVariants}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

ProductTable.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      condition: PropTypes.string.isRequired,
      is_featured: PropTypes.bool.isRequired,
      status: PropTypes.bool.isRequired,
      variantValues: PropTypes.arrayOf(PropTypes.object), // Optional - only for single products
      productType: PropTypes.shape({
        type: PropTypes.string,
        variantCount: PropTypes.number,
      }),
      thumbnail_image: PropTypes.shape({
        path: PropTypes.string,
      }),
      producturl: PropTypes.string.isRequired,
    })
  ).isRequired,
  auth: PropTypes.shape({
    ip: PropTypes.string.isRequired,
  }).isRequired,
  onFeaturedChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onViewVariants: PropTypes.func.isRequired,
};

export default ProductTable;
