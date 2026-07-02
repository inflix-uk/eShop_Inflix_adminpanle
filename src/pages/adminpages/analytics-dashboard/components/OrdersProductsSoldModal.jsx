import { useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

function SummaryTile({ label, value, tone }) {
  const tones = {
    green: "bg-emerald-50 border-emerald-100 text-emerald-900",
    blue: "bg-sky-50 border-sky-100 text-sky-900",
  };

  return (
    <div className={`rounded-lg border px-4 py-4 ${tones[tone] || tones.blue}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

SummaryTile.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  tone: PropTypes.oneOf(["green", "blue"]).isRequired,
};

export default function OrdersProductsSoldModal({ isOpen, onClose, data }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) return null;

  return createPortal(
    <div
      className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-products-sold-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-gray-100 bg-white">
          <div className="min-w-0 pr-2">
            <h2
              id="orders-products-sold-title"
              className="m-0 text-xl font-semibold leading-tight text-gray-900"
            >
              Orders &amp; products sold
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">{data.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile label="Orders" value={data.orders} tone="green" />
            <SummaryTile label="Units sold" value={data.unitsSold} tone="blue" />
            <SummaryTile label="Revenue" value={data.revenue} tone="blue" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Products sold</h3>
            {data.products.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center border border-dashed border-gray-200 rounded-lg">
                No products sold in this date range.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-right">Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.products.map((row) => (
                      <tr key={row.name} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 text-gray-900 font-medium">{row.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {row.qty}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {row.revenue}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                          {row.orders}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

OrdersProductsSoldModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.shape({
    subtitle: PropTypes.string.isRequired,
    orders: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    unitsSold: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    revenue: PropTypes.string.isRequired,
    products: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        revenue: PropTypes.string.isRequired,
        orders: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      })
    ).isRequired,
  }),
};
