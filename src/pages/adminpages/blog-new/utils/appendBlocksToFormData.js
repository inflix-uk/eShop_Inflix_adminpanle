import {
  extractWidgetSlideDataUrls,
  extractNewsletterWidgetImageDataUrls,
  extractGalleryWidgetImageDataUrls,
  extractTestimonialsWidgetAvatarDataUrls,
  extractVideoWidgetDataUrls,
  extractSiteBannersWidgetImageDataUrls,
  extractCategoryCardsWidgetImageDataUrls,
  extractPromotionalSectionsWidgetImageDataUrls,
} from "./blockContentValidation";

function dataURLToFile(dataURL, filename) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Serialize block rows for multipart: data URLs → files + __FILE_REFERENCE__ placeholders.
 * @param {FormData} formData
 * @param {unknown[]} blocks
 * @param {{ jsonField: string; countField: string; filePrefix: string; imageFilenamePrefix?: string }} opts
 */
export function appendBlocksToFormData(formData, blocks, opts) {
  const {
    jsonField,
    countField,
    filePrefix,
    imageFilenamePrefix = "block",
  } = opts;

  const list = Array.isArray(blocks) ? blocks : [];
  const processedBlocks = JSON.parse(JSON.stringify(list));
  const blockImageFiles = [];
  let blockImageIndex = 0;

  processedBlocks.forEach((row, rowIndex) => {
    if (!row?.columns) return;
    row.columns.forEach((column, colIndex) => {
      if (!column?.blocks) return;
      column.blocks.forEach((block, blockIndex) => {
        if (block.type === "image" && block.content && block.content.url) {
          if (
            typeof block.content.url === "string" &&
            block.content.url.startsWith("data:")
          ) {
            const filename = `${imageFilenamePrefix}-${rowIndex}-${colIndex}-${blockIndex}-${Date.now()}.jpg`;
            try {
              const file = dataURLToFile(block.content.url, filename);
              blockImageFiles.push({ file });
              block.content.url = `__FILE_REFERENCE__${blockImageIndex}__`;
              blockImageIndex += 1;
            } catch (err) {
              console.error("Error converting block image data URL:", err);
            }
          }
        }
      });
    });
  });

  const widgetExtract = extractWidgetSlideDataUrls(
    processedBlocks,
    dataURLToFile,
    blockImageIndex
  );
  blockImageFiles.push(...widgetExtract.blockImageFiles);

  const nlExtract = extractNewsletterWidgetImageDataUrls(
    processedBlocks,
    dataURLToFile,
    widgetExtract.blockImageIndex
  );
  blockImageFiles.push(...nlExtract.blockImageFiles);

  const galleryExtract = extractGalleryWidgetImageDataUrls(
    processedBlocks,
    dataURLToFile,
    nlExtract.blockImageIndex
  );
  blockImageFiles.push(...galleryExtract.blockImageFiles);

  const testimonialsExtract = extractTestimonialsWidgetAvatarDataUrls(
    processedBlocks,
    dataURLToFile,
    galleryExtract.blockImageIndex
  );
  blockImageFiles.push(...testimonialsExtract.blockImageFiles);

  const vidExtract = extractVideoWidgetDataUrls(
    processedBlocks,
    dataURLToFile,
    testimonialsExtract.blockImageIndex
  );
  blockImageFiles.push(...vidExtract.blockImageFiles);

  const siteBannersExtract = extractSiteBannersWidgetImageDataUrls(
    processedBlocks,
    dataURLToFile,
    vidExtract.blockImageIndex
  );
  blockImageFiles.push(...siteBannersExtract.blockImageFiles);

  const categoryCardsExtract = extractCategoryCardsWidgetImageDataUrls(
    processedBlocks,
    dataURLToFile,
    siteBannersExtract.blockImageIndex
  );
  blockImageFiles.push(...categoryCardsExtract.blockImageFiles);

  const promotionalSectionsExtract = extractPromotionalSectionsWidgetImageDataUrls(
    processedBlocks,
    dataURLToFile,
    categoryCardsExtract.blockImageIndex
  );
  blockImageFiles.push(...promotionalSectionsExtract.blockImageFiles);

  formData.append(jsonField, JSON.stringify(processedBlocks));
  formData.append(countField, String(blockImageFiles.length));
  blockImageFiles.forEach((item, index) => {
    if (item.file instanceof File) {
      formData.append(`${filePrefix}_${index}`, item.file);
    }
  });
}
