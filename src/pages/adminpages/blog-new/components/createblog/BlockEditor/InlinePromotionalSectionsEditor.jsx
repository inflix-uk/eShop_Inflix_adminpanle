"use client";

import PropTypes from "prop-types";
import ImageUploader from "../../../../banners/components/ImageUploader";
import { normalizePromotionalSectionsContent, patchPromotionalSectionsWidget } from "./promotionalSectionsWidgetDefaults";

export default function InlinePromotionalSectionsEditor({ content, blockId, onChange }) {
  const v = normalizePromotionalSectionsContent(content);

  const apply = (patch) => {
    onChange(blockId, patchPromotionalSectionsWidget(content, patch));
  };

  const toDataUrl = (fieldPath, file) => {
    if (!file) {
      if (fieldPath === "bnplBg") {
        apply({ buyNowPayLater: { backgroundImage: "" } });
      } else if (fieldPath.startsWith("pay_")) {
        const i = parseInt(fieldPath.split("_")[1], 10);
        const next = [...v.buyNowPayLater.paymentImages];
        next[i] = "";
        apply({ buyNowPayLater: { paymentImages: next } });
      } else if (fieldPath === "sellBg") {
        apply({ sellBuyCards: { sellCard: { backgroundImage: "" } } });
      } else if (fieldPath === "sellProd") {
        apply({ sellBuyCards: { sellCard: { productImage: "" } } });
      } else if (fieldPath === "buyBg") {
        apply({ sellBuyCards: { buyCard: { backgroundImage: "" } } });
      } else if (fieldPath === "buyProd") {
        apply({ sellBuyCards: { buyCard: { productImage: "" } } });
      } else if (fieldPath === "tinyBg") {
        apply({ tinyPhoneBanner: { backgroundImage: "" } });
      } else if (fieldPath === "tinyCenter") {
        apply({ tinyPhoneBanner: { centerImage: "" } });
      } else if (fieldPath === "tinyRight") {
        apply({ tinyPhoneBanner: { rightImage: "" } });
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result || "";
      if (fieldPath === "bnplBg") {
        apply({ buyNowPayLater: { backgroundImage: url } });
      } else if (fieldPath.startsWith("pay_")) {
        const i = parseInt(fieldPath.split("_")[1], 10);
        const next = [...v.buyNowPayLater.paymentImages];
        next[i] = url;
        apply({ buyNowPayLater: { paymentImages: next } });
      } else if (fieldPath === "sellBg") {
        apply({ sellBuyCards: { sellCard: { backgroundImage: url } } });
      } else if (fieldPath === "sellProd") {
        apply({ sellBuyCards: { sellCard: { productImage: url } } });
      } else if (fieldPath === "buyBg") {
        apply({ sellBuyCards: { buyCard: { backgroundImage: url } } });
      } else if (fieldPath === "buyProd") {
        apply({ sellBuyCards: { buyCard: { productImage: url } } });
      } else if (fieldPath === "tinyBg") {
        apply({ tinyPhoneBanner: { backgroundImage: url } });
      } else if (fieldPath === "tinyCenter") {
        apply({ tinyPhoneBanner: { centerImage: url } });
      } else if (fieldPath === "tinyRight") {
        apply({ tinyPhoneBanner: { rightImage: url } });
      }
    };
    reader.readAsDataURL(file);
  };

  const bnpl = v.buyNowPayLater;
  const sell = v.sellBuyCards.sellCard;
  const buy = v.sellBuyCards.buyCard;
  const tiny = v.tinyPhoneBanner;

  return (
    <div className="space-y-4 max-h-[min(75vh,800px)] overflow-y-auto pr-1">
      <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm space-y-3">
        <div className="text-xs font-semibold text-indigo-900 border-b border-indigo-100 pb-2">
          Buy Now Pay Later
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Heading</label>
            <input
              type="text"
              value={bnpl.heading}
              onChange={(e) => apply({ buyNowPayLater: { heading: e.target.value } })}
              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Paragraph</label>
            <textarea
              value={bnpl.paragraph}
              onChange={(e) => apply({ buyNowPayLater: { paragraph: e.target.value } })}
              rows={2}
              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <ImageUploader
          label="Background image"
          value={bnpl.backgroundImage || ""}
          onChange={(file) => toDataUrl("bnplBg", file)}
          maxSizeMB={4}
        />
        <div>
          <p className="text-xs font-medium text-gray-600 mb-2">Payment logos (optional, up to 3)</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <ImageUploader
                key={i}
                label={`Payment ${i + 1}`}
                value={bnpl.paymentImages[i] || ""}
                onChange={(file) => toDataUrl(`pay_${i}`, file)}
                maxSizeMB={2}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm space-y-4">
        <div className="text-xs font-semibold text-indigo-900 border-b border-indigo-100 pb-2">
          Sell / Buy cards
        </div>
        {["sellCard", "buyCard"].map((key) => {
          const card = key === "sellCard" ? sell : buy;
          const label = key === "sellCard" ? "Sell card" : "Buy card";
          const prefix = key === "sellCard" ? "sell" : "buy";
          return (
            <div key={key} className="space-y-2 border-t border-indigo-50 pt-3 first:border-t-0 first:pt-0">
              <div className="text-xs font-medium text-gray-700">{label}</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <div>
                  <label className="block text-xs text-gray-600">Heading</label>
                  <input
                    type="text"
                    value={card.heading}
                    onChange={(e) =>
                      apply({
                        sellBuyCards: { [key]: { heading: e.target.value } },
                      })
                    }
                    className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Paragraph</label>
                  <textarea
                    value={card.paragraph}
                    onChange={(e) =>
                      apply({
                        sellBuyCards: { [key]: { paragraph: e.target.value } },
                      })
                    }
                    rows={2}
                    className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Button label</label>
                  <input
                    type="text"
                    value={card.buttonName}
                    onChange={(e) =>
                      apply({
                        sellBuyCards: { [key]: { buttonName: e.target.value } },
                      })
                    }
                    className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Button link</label>
                  <input
                    type="text"
                    value={card.buttonLink}
                    onChange={(e) =>
                      apply({
                        sellBuyCards: { [key]: { buttonLink: e.target.value } },
                      })
                    }
                    className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                    placeholder="/shop or https://..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                <ImageUploader
                  label="Background image"
                  value={card.backgroundImage || ""}
                  onChange={(file) => toDataUrl(`${prefix}Bg`, file)}
                  maxSizeMB={4}
                />
                <ImageUploader
                  label="Product image (optional)"
                  value={card.productImage || ""}
                  onChange={(file) => toDataUrl(`${prefix}Prod`, file)}
                  maxSizeMB={4}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-indigo-200 bg-white p-3 shadow-sm space-y-3">
        <div className="text-xs font-semibold text-indigo-900 border-b border-indigo-100 pb-2">
          Tiny Phone banner
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div>
            <label className="block text-xs text-gray-600">Heading</label>
            <input
              type="text"
              value={tiny.heading}
              onChange={(e) => apply({ tinyPhoneBanner: { heading: e.target.value } })}
              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Paragraph</label>
            <textarea
              value={tiny.paragraph}
              onChange={(e) => apply({ tinyPhoneBanner: { paragraph: e.target.value } })}
              rows={2}
              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Button label</label>
            <input
              type="text"
              value={tiny.buttonName}
              onChange={(e) => apply({ tinyPhoneBanner: { buttonName: e.target.value } })}
              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Button link</label>
            <input
              type="text"
              value={tiny.buttonLink}
              onChange={(e) => apply({ tinyPhoneBanner: { buttonLink: e.target.value } })}
              className="mt-0.5 w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <ImageUploader
            label="Background"
            value={tiny.backgroundImage || ""}
            onChange={(file) => toDataUrl("tinyBg", file)}
            maxSizeMB={4}
          />
          <ImageUploader
            label="Center image"
            value={tiny.centerImage || ""}
            onChange={(file) => toDataUrl("tinyCenter", file)}
            maxSizeMB={4}
          />
          <ImageUploader
            label="Right image"
            value={tiny.rightImage || ""}
            onChange={(file) => toDataUrl("tinyRight", file)}
            maxSizeMB={4}
          />
        </div>
      </div>
    </div>
  );
}

InlinePromotionalSectionsEditor.propTypes = {
  content: PropTypes.object,
  blockId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
