/** Default shape for promotionalSections widget blocks (inline, same fields as Promotional sections admin). */

export function createDefaultPromotionalSectionsContent() {
  return {
    widgetType: "promotionalSections",
    buyNowPayLater: {
      heading: "",
      paragraph: "",
      backgroundImage: "",
      paymentImages: ["", "", ""],
    },
    sellBuyCards: {
      sellCard: {
        heading: "",
        paragraph: "",
        buttonName: "",
        buttonLink: "",
        backgroundImage: "",
        productImage: "",
      },
      buyCard: {
        heading: "",
        paragraph: "",
        buttonName: "",
        buttonLink: "",
        backgroundImage: "",
        productImage: "",
      },
    },
    tinyPhoneBanner: {
      heading: "",
      paragraph: "",
      buttonName: "",
      buttonLink: "",
      backgroundImage: "",
      centerImage: "",
      rightImage: "",
    },
  };
}

export function normalizePromotionalSectionsContent(raw) {
  const d = createDefaultPromotionalSectionsContent();
  if (!raw || raw.widgetType !== "promotionalSections") {
    return d;
  }
  const pm = Array.isArray(raw.buyNowPayLater?.paymentImages)
    ? raw.buyNowPayLater.paymentImages
    : [];
  return {
    widgetType: "promotionalSections",
    buyNowPayLater: {
      ...d.buyNowPayLater,
      ...raw.buyNowPayLater,
      paymentImages: [0, 1, 2].map((i) =>
        typeof pm[i] === "string" ? pm[i] : d.buyNowPayLater.paymentImages[i]
      ),
    },
    sellBuyCards: {
      sellCard: {
        ...d.sellBuyCards.sellCard,
        ...raw.sellBuyCards?.sellCard,
      },
      buyCard: {
        ...d.sellBuyCards.buyCard,
        ...raw.sellBuyCards?.buyCard,
      },
    },
    tinyPhoneBanner: {
      ...d.tinyPhoneBanner,
      ...raw.tinyPhoneBanner,
    },
  };
}

/**
 * Deep-merge a partial patch (e.g. { buyNowPayLater: { heading: "x" } }) into current widget content.
 */
export function patchPromotionalSectionsWidget(currentContent, patch) {
  const base = normalizePromotionalSectionsContent(currentContent);
  if (!patch) return base;
  return {
    widgetType: "promotionalSections",
    buyNowPayLater: {
      ...base.buyNowPayLater,
      ...patch.buyNowPayLater,
      paymentImages:
        patch.buyNowPayLater?.paymentImages !== undefined
          ? [0, 1, 2].map((i) => {
              const row = patch.buyNowPayLater.paymentImages;
              return typeof row[i] === "string" ? row[i] : base.buyNowPayLater.paymentImages[i];
            })
          : base.buyNowPayLater.paymentImages,
    },
    sellBuyCards: {
      sellCard: {
        ...base.sellBuyCards.sellCard,
        ...patch.sellBuyCards?.sellCard,
      },
      buyCard: {
        ...base.sellBuyCards.buyCard,
        ...patch.sellBuyCards?.buyCard,
      },
    },
    tinyPhoneBanner: {
      ...base.tinyPhoneBanner,
      ...patch.tinyPhoneBanner,
    },
  };
}
