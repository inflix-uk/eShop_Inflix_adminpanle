/**
 * Whether a single content block counts as "having content" for publish validation.
 */
export function blockHasValidContent(block) {
  if (!block) return false;
  if (block.type === "text" && typeof block.content === "string" && block.content.trim().length > 0) {
    return true;
  }
  if (
    block.type === "image" &&
    block.content &&
    typeof block.content.url === "string" &&
    block.content.url.trim().length > 0
  ) {
    return true;
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "slider" &&
    Array.isArray(block.content.slides)
  ) {
    return block.content.slides.some(
      (s) =>
        (s.heading && String(s.heading).trim().length > 0) ||
        (s.description && String(s.description).trim().length > 0) ||
        (s.imageUrl && String(s.imageUrl).trim().length > 0)
    );
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "newsletter"
  ) {
    const c = block.content;
    return (
      (c.heading && String(c.heading).trim().length > 0) ||
      (c.description && String(c.description).trim().length > 0) ||
      (c.buttonLabel && String(c.buttonLabel).trim().length > 0) ||
      (c.placeholder && String(c.placeholder).trim().length > 0) ||
      (c.imageUrl && String(c.imageUrl).trim().length > 0)
    );
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "video"
  ) {
    const u = block.content.videoUrl;
    return typeof u === "string" && u.trim().length > 0;
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "map"
  ) {
    const u = block.content.embedUrl;
    return typeof u === "string" && u.trim().length > 0;
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "gallery" &&
    Array.isArray(block.content.items)
  ) {
    return block.content.items.some(
      (it) => it?.imageUrl && String(it.imageUrl).trim().length > 0
    );
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "iconBox" &&
    Array.isArray(block.content.items)
  ) {
    return block.content.items.some(
      (it) => it?.iconCode && String(it.iconCode).trim().length > 0
    );
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "testimonials" &&
    Array.isArray(block.content.items)
  ) {
    return block.content.items.some(
      (it) => it?.quote && String(it.quote).trim().length > 0
    );
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "latestBlogs"
  ) {
    return true;
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "htmlCss"
  ) {
    const h = block.content.html;
    const c = block.content.css;
    return (
      (typeof h === "string" && h.trim().length > 0) ||
      (typeof c === "string" && c.trim().length > 0)
    );
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "trustpilot"
  ) {
    const s = block.content.embedScript;
    return typeof s === "string" && s.trim().length > 0;
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "siteBanners" &&
    Array.isArray(block.content.items)
  ) {
    return block.content.items.some((it) => {
      if (!it || it.isActive === false) return false;
      const large = it.imageLarge && String(it.imageLarge).trim().length > 0;
      const small = it.imageSmall && String(it.imageSmall).trim().length > 0;
      if (!large || !small || !it.altText || !String(it.altText).trim()) return false;
      if (it.type === "simple") {
        return (
          it.buttonText &&
          String(it.buttonText).trim().length > 0 &&
          it.buttonLink &&
          String(it.buttonLink).trim().length > 0
        );
      }
      if (it.type === "full") {
        const c = it.content || {};
        return (
          c.title &&
          String(c.title).trim().length > 0 &&
          c.subtitle &&
          String(c.subtitle).trim().length > 0 &&
          c.buynow &&
          String(c.buynow).trim().length > 0
        );
      }
      return false;
    });
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "categoryCards" &&
    Array.isArray(block.content.items)
  ) {
    return block.content.items.some((it) => {
      if (!it || it.isActive === false) return false;
      const name = it.categoryName && String(it.categoryName).trim().length > 0;
      const link = it.shopNowLink && String(it.shopNowLink).trim().length > 0;
      const bg = it.backgroundImage && String(it.backgroundImage).trim().length > 0;
      return name && link && bg;
    });
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "promotionalSections"
  ) {
    const b = block.content.buyNowPayLater || {};
    const hasBnpl =
      b.heading &&
      String(b.heading).trim().length > 0 &&
      b.paragraph &&
      String(b.paragraph).trim().length > 0 &&
      b.backgroundImage &&
      String(b.backgroundImage).trim().length > 0;
    const sx = block.content.sellBuyCards?.sellCard || {};
    const by = block.content.sellBuyCards?.buyCard || {};
    const hasSellBuy =
      sx.heading &&
      String(sx.heading).trim().length > 0 &&
      sx.buttonLink &&
      String(sx.buttonLink).trim().length > 0 &&
      sx.backgroundImage &&
      String(sx.backgroundImage).trim().length > 0 &&
      by.heading &&
      String(by.heading).trim().length > 0 &&
      by.buttonLink &&
      String(by.buttonLink).trim().length > 0 &&
      by.backgroundImage &&
      String(by.backgroundImage).trim().length > 0;
    const t = block.content.tinyPhoneBanner || {};
    const hasTiny =
      t.heading &&
      String(t.heading).trim().length > 0 &&
      t.paragraph &&
      String(t.paragraph).trim().length > 0 &&
      t.buttonName &&
      String(t.buttonName).trim().length > 0 &&
      t.buttonLink &&
      String(t.buttonLink).trim().length > 0;
    return hasBnpl || hasSellBuy || hasTiny;
  }
  if (
    block.type === "widget" &&
    block.content &&
    block.content.widgetType === "faq"
  ) {
    const c = block.content;
    if (c.sectionHeading && String(c.sectionHeading).trim().length > 0) {
      return true;
    }
    const items = Array.isArray(c.items) ? c.items : [];
    return items.some(
      (it) =>
        (it?.question && String(it.question).trim().length > 0) ||
        (it?.answer && String(it.answer).trim().length > 0)
    );
  }
  if (block.type === "products" && block.content) {
    const src = block.content.productSource;
    if (src === "latest") return true;
    if (
      Array.isArray(block.content.productIds) &&
      block.content.productIds.length > 0
    ) {
      return true;
    }
  }
  return false;
}

export function blocksHaveRenderableContent(blocks) {
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) return false;
  return blocks.some((row) =>
    row?.columns?.some((column) => column?.blocks?.some(blockHasValidContent))
  );
}

/**
 * Collect data-URL slide images from widget blocks for upload (same pattern as image blocks).
 * Mutates processedBlocks in place; returns { files: { file, path }[], nextIndex }.
 */
export function extractWidgetSlideDataUrls(processedBlocks, dataURLToFile, startIndex = 0) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "slider" ||
          !Array.isArray(block.content.slides)
        ) {
          return;
        }
        block.content.slides.forEach((slide, slideIndex) => {
          const url = slide?.imageUrl;
          if (typeof url === "string" && url.startsWith("data:")) {
            const filename = `block-widget-${rowIndex}-${colIndex}-${blockIndex}-s${slideIndex}-${Date.now()}.jpg`;
            try {
              const file = dataURLToFile(url, filename);
              blockImageFiles.push({
                file,
                path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][slides][${slideIndex}][imageUrl]`,
              });
              slide.imageUrl = `__FILE_REFERENCE__${blockImageIndex}__`;
              blockImageIndex += 1;
            } catch (e) {
              console.error("Widget slide data URL conversion failed:", e);
            }
          }
        });
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

/**
 * Data-URL optional hero image on newsletter widget blocks.
 */
export function extractNewsletterWidgetImageDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "newsletter"
        ) {
          return;
        }
        const url = block.content.imageUrl;
        if (typeof url === "string" && url.startsWith("data:")) {
          const filename = `block-widget-nl-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.jpg`;
          try {
            const file = dataURLToFile(url, filename);
            blockImageFiles.push({
              file,
              path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][imageUrl]`,
            });
            block.content.imageUrl = `__FILE_REFERENCE__${blockImageIndex}__`;
            blockImageIndex += 1;
          } catch (e) {
            console.error("Newsletter widget image data URL conversion failed:", e);
          }
        }
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

/**
 * Data-URL images on gallery widget blocks.
 */
export function extractGalleryWidgetImageDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "gallery" ||
          !Array.isArray(block.content.items)
        ) {
          return;
        }
        block.content.items.forEach((item, itemIndex) => {
          const url = item?.imageUrl;
          if (typeof url === "string" && url.startsWith("data:")) {
            const filename = `block-widget-gallery-${rowIndex}-${colIndex}-${blockIndex}-i${itemIndex}-${Date.now()}.jpg`;
            try {
              const file = dataURLToFile(url, filename);
              blockImageFiles.push({
                file,
                path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][items][${itemIndex}][imageUrl]`,
              });
              item.imageUrl = `__FILE_REFERENCE__${blockImageIndex}__`;
              blockImageIndex += 1;
            } catch (e) {
              console.error("Gallery widget data URL conversion failed:", e);
            }
          }
        });
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

/**
 * Data-URL avatar images on testimonials widget blocks.
 */
export function extractTestimonialsWidgetAvatarDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "testimonials" ||
          !Array.isArray(block.content.items)
        ) {
          return;
        }
        block.content.items.forEach((item, itemIndex) => {
          const url = item?.avatarUrl;
          if (typeof url === "string" && url.startsWith("data:")) {
            const filename = `block-widget-testimonials-${rowIndex}-${colIndex}-${blockIndex}-i${itemIndex}-${Date.now()}.jpg`;
            try {
              const file = dataURLToFile(url, filename);
              blockImageFiles.push({
                file,
                path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][items][${itemIndex}][avatarUrl]`,
              });
              item.avatarUrl = `__FILE_REFERENCE__${blockImageIndex}__`;
              blockImageIndex += 1;
            } catch (e) {
              console.error("Testimonials widget avatar data URL conversion failed:", e);
            }
          }
        });
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

/**
 * Data-URL video file on video widget blocks (uploaded .mp4 / .webm / .ogg).
 */
export function extractVideoWidgetDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "video"
        ) {
          return;
        }
        const url = block.content.videoUrl;
        if (typeof url === "string" && url.startsWith("data:")) {
          let ext = "mp4";
          if (url.startsWith("data:video/webm")) ext = "webm";
          else if (
            url.startsWith("data:video/ogg") ||
            url.startsWith("data:video/ogv")
          ) {
            ext = "ogg";
          }
          const filename = `block-widget-video-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.${ext}`;
          try {
            const file = dataURLToFile(url, filename);
            blockImageFiles.push({
              file,
              path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][videoUrl]`,
            });
            block.content.videoUrl = `__FILE_REFERENCE__${blockImageIndex}__`;
            blockImageIndex += 1;
          } catch (e) {
            console.error("Video widget data URL conversion failed:", e);
          }
        }
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

const SITE_BANNER_IMAGE_FIELDS = ["imageLarge", "imageSmall", "extraImage"];

/**
 * Data-URL images on siteBanners widget items (large, small, optional extra).
 */
export function extractSiteBannersWidgetImageDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "siteBanners" ||
          !Array.isArray(block.content.items)
        ) {
          return;
        }
        block.content.items.forEach((bannerItem, itemIndex) => {
          if (!bannerItem) return;
          SITE_BANNER_IMAGE_FIELDS.forEach((field) => {
            const url = bannerItem[field];
            if (typeof url === "string" && url.startsWith("data:")) {
              const filename = `block-widget-sitebanners-${rowIndex}-${colIndex}-${blockIndex}-i${itemIndex}-${field}-${Date.now()}.jpg`;
              try {
                const file = dataURLToFile(url, filename);
                blockImageFiles.push({
                  file,
                  path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][items][${itemIndex}][${field}]`,
                });
                bannerItem[field] = `__FILE_REFERENCE__${blockImageIndex}__`;
                blockImageIndex += 1;
              } catch (e) {
                console.error("Site banners widget image data URL conversion failed:", e);
              }
            }
          });
        });
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

const CATEGORY_CARD_IMAGE_FIELDS = ["backgroundImage", "categoryImage"];

/**
 * Data-URL images on categoryCards widget items (background + optional category image).
 */
export function extractCategoryCardsWidgetImageDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "categoryCards" ||
          !Array.isArray(block.content.items)
        ) {
          return;
        }
        block.content.items.forEach((cardItem, itemIndex) => {
          if (!cardItem) return;
          CATEGORY_CARD_IMAGE_FIELDS.forEach((field) => {
            const url = cardItem[field];
            if (typeof url === "string" && url.startsWith("data:")) {
              const filename = `block-widget-categorycards-${rowIndex}-${colIndex}-${blockIndex}-i${itemIndex}-${field}-${Date.now()}.jpg`;
              try {
                const file = dataURLToFile(url, filename);
                blockImageFiles.push({
                  file,
                  path: `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content][items][${itemIndex}][${field}]`,
                });
                cardItem[field] = `__FILE_REFERENCE__${blockImageIndex}__`;
                blockImageIndex += 1;
              } catch (e) {
                console.error("Category cards widget image data URL conversion failed:", e);
              }
            }
          });
        });
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}

/**
 * Data-URL images on promotionalSections widget (top banner, two cards, bottom strip).
 */
export function extractPromotionalSectionsWidgetImageDataUrls(
  processedBlocks,
  dataURLToFile,
  startIndex = 0
) {
  const blockImageFiles = [];
  let blockImageIndex = startIndex;

  if (!processedBlocks || !Array.isArray(processedBlocks)) {
    return { blockImageFiles, blockImageIndex };
  }

  processedBlocks.forEach((row, rowIndex) => {
    row.columns?.forEach((column, colIndex) => {
      column.blocks?.forEach((block, blockIndex) => {
        if (
          block.type !== "widget" ||
          block.content?.widgetType !== "promotionalSections"
        ) {
          return;
        }
        const base = `blocks[${rowIndex}][columns][${colIndex}][blocks][${blockIndex}][content]`;
        const c = block.content;

        const replaceDataUrl = (url, pathSuffix) => {
          if (typeof url !== "string" || !url.startsWith("data:")) return url;
          const filename = `block-widget-promo-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.jpg`;
          try {
            const file = dataURLToFile(url, filename);
            blockImageFiles.push({
              file,
              path: `${base}${pathSuffix}`,
            });
            const ref = `__FILE_REFERENCE__${blockImageIndex}__`;
            blockImageIndex += 1;
            return ref;
          } catch (e) {
            console.error("Promotional sections widget image data URL conversion failed:", e);
          }
          return url;
        };

        if (c.buyNowPayLater) {
          const bn = c.buyNowPayLater;
          if (bn.backgroundImage) {
            bn.backgroundImage = replaceDataUrl(bn.backgroundImage, "[buyNowPayLater][backgroundImage]");
          }
          if (Array.isArray(bn.paymentImages)) {
            bn.paymentImages = bn.paymentImages.map((img, i) =>
              replaceDataUrl(img, `[buyNowPayLater][paymentImages][${i}]`)
            );
          }
        }

        if (c.sellBuyCards?.sellCard) {
          const s = c.sellBuyCards.sellCard;
          if (s.backgroundImage) {
            s.backgroundImage = replaceDataUrl(
              s.backgroundImage,
              "[sellBuyCards][sellCard][backgroundImage]"
            );
          }
          if (s.productImage) {
            s.productImage = replaceDataUrl(s.productImage, "[sellBuyCards][sellCard][productImage]");
          }
        }
        if (c.sellBuyCards?.buyCard) {
          const b = c.sellBuyCards.buyCard;
          if (b.backgroundImage) {
            b.backgroundImage = replaceDataUrl(
              b.backgroundImage,
              "[sellBuyCards][buyCard][backgroundImage]"
            );
          }
          if (b.productImage) {
            b.productImage = replaceDataUrl(b.productImage, "[sellBuyCards][buyCard][productImage]");
          }
        }

        if (c.tinyPhoneBanner) {
          const t = c.tinyPhoneBanner;
          if (t.backgroundImage) {
            t.backgroundImage = replaceDataUrl(t.backgroundImage, "[tinyPhoneBanner][backgroundImage]");
          }
          if (t.centerImage) {
            t.centerImage = replaceDataUrl(t.centerImage, "[tinyPhoneBanner][centerImage]");
          }
          if (t.rightImage) {
            t.rightImage = replaceDataUrl(t.rightImage, "[tinyPhoneBanner][rightImage]");
          }
        }
      });
    });
  });

  return { blockImageFiles, blockImageIndex };
}
