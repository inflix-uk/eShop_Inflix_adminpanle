import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import ProductOptionChecklist from "./ProductOptionChecklist";

const MANAGE_OPTIONS_PATH = "/admin/product-options";
const ATTRIBUTE_SLUGS = ["top_section", "top-section"];
const MAX_ITEMS = 6;

/**
 * "Product highlights" (Top Section) picker.
 * Reads/writes `product.topSectionItems` (array of option slugs, max 6, saved order = display order).
 * Used on the Edit Product page.
 */
export default function ProductTopSectionSelector({ product, setProduct }) {
  const auth = useAuth();
  const [options, setOptions] = useState([]);
  const [attributeId, setAttributeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the "Top Section" options from the VariantAttribute API
  useEffect(() => {
    let ignore = false;

    const fetchOptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${auth.ip}get/variant-attributes`);
        if (ignore) return;
        if (response.data.status === 200 || response.data.status === 201) {
          const attribute = (response.data.variantAttributes || []).find((attr) =>
            ATTRIBUTE_SLUGS.includes(attr.slug)
          );
          setAttributeId(attribute?._id || null);
          setOptions((attribute?.values || []).filter((item) => item.isActive !== false));
        } else {
          setError("Couldn't load the highlights. Please refresh the page.");
        }
      } catch (err) {
        if (ignore) return;
        console.error("Error fetching top section items:", err);
        setError("Couldn't load the highlights. Please refresh the page.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchOptions();
    return () => {
      ignore = true;
    };
  }, [auth.ip]);

  return (
    <ProductOptionChecklist
      title="Product highlights"
      legacyLabel="Top Section"
      description={`Tick up to ${MAX_ITEMS} short selling points, e.g. free delivery, 30-day returns. Customers see them near the top of the product page, beside the price and delivery info.`}
      options={options}
      value={product?.topSectionItems}
      onChange={(next) => setProduct({ ...product, topSectionItems: next })}
      max={MAX_ITEMS}
      ordered
      isLoading={isLoading}
      error={error}
      emptyText="No highlights have been set up yet. Add them in Product Options first."
      searchPlaceholder="Search highlights..."
      manageHref={attributeId ? `${MANAGE_OPTIONS_PATH}?attribute=${attributeId}` : MANAGE_OPTIONS_PATH}
      apiBase={auth.ip}
    />
  );
}

ProductTopSectionSelector.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
