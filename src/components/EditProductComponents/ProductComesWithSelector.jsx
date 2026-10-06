import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import ProductOptionChecklist from "./ProductOptionChecklist";

const MANAGE_OPTIONS_PATH = "/admin/product-options";
const ATTRIBUTE_SLUGS = ["comes_with", "comes-with"];

/**
 * "What's in the box" (Comes With) picker.
 * Reads/writes `product.comesWithItems` (array of option slugs).
 * Used on both the Edit Product and Create Product pages.
 */
export default function ProductComesWithSelector({ product, setProduct }) {
  const auth = useAuth();
  const [options, setOptions] = useState([]);
  const [attributeId, setAttributeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the "Comes With" options from the VariantAttribute API
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
          setError("Couldn't load the accessories. Please refresh the page.");
        }
      } catch (err) {
        if (ignore) return;
        console.error("Error fetching comes with items:", err);
        setError("Couldn't load the accessories. Please refresh the page.");
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
      title="What's in the box"
      legacyLabel="Comes With"
      description={"Tick the accessories the customer gets with this product, e.g. charging cable, power adapter. Customers see them under the “Comes with” list on the product page."}
      options={options}
      value={product?.comesWithItems}
      onChange={(next) => setProduct({ ...product, comesWithItems: next })}
      isLoading={isLoading}
      error={error}
      emptyText="No accessories have been set up yet. Add them in Product Options first."
      searchPlaceholder="Search accessories..."
      manageHref={attributeId ? `${MANAGE_OPTIONS_PATH}?attribute=${attributeId}` : MANAGE_OPTIONS_PATH}
      apiBase={auth.ip}
    />
  );
}

ProductComesWithSelector.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
};
