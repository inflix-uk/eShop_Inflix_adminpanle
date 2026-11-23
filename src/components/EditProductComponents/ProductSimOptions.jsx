import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import ProductOptionChecklist from "./ProductOptionChecklist";

const MANAGE_OPTIONS_PATH = "/admin/product-options";
const ATTRIBUTE_SLUGS = ["select_options", "select-options"];

/**
 * "Select Options" (SIM option) picker, laid out like "What's in the box":
 * icon tiles with a tick box. Only one can be chosen; ticking another
 * replaces it. Reads/writes `product.selectOption` (a single option slug).
 * Customers see it as the "SIM Option" section above "Comes with".
 */
export default function ProductSimOptions({ setProduct, product }) {
  const auth = useAuth();
  const [options, setOptions] = useState([]);
  const [attributeId, setAttributeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the "Select Options" items from the VariantAttribute API
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
          setError("Couldn't load the options. Please refresh the page.");
        }
      } catch (err) {
        if (ignore) return;
        console.error("Error fetching select options:", err);
        setError("Couldn't load the options. Please refresh the page.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchOptions();
    return () => {
      ignore = true;
    };
  }, [auth.ip]);

  const value = product?.selectOption ? [product.selectOption] : [];

  return (
    <ProductOptionChecklist
      title="Select Options"
      legacyLabel="SIM Option"
      description={"Tick the SIM type for this product, e.g. Dual Sim (Physical Sim + eSIM). Only one can be chosen. Customers see it as the “SIM Option” section above “Comes with” on the product page."}
      options={options}
      value={value}
      onChange={(next) =>
        setProduct({ ...product, selectOption: next.length ? next[next.length - 1] : null })
      }
      single
      isLoading={isLoading}
      error={error}
      emptyText="No options have been set up yet. Add them in Product Options first."
      searchPlaceholder="Search options..."
      manageHref={attributeId ? `${MANAGE_OPTIONS_PATH}?attribute=${attributeId}` : MANAGE_OPTIONS_PATH}
      apiBase={auth.ip}
    />
  );
}

ProductSimOptions.propTypes = {
  setProduct: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
};
