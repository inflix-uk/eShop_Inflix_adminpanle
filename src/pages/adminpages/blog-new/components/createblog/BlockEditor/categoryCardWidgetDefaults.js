import { nanoid } from "nanoid";

export const DEFAULT_CATEGORY_CARDS_SECTION = {
  headingText: "Popular Categories",
  headingColor: "var(--secondary)",
  dividerColor: "#000000",
  sectionBackgroundColor: "",
};

/** One card in a categoryCards block (mirrors Category Cards admin). */
export function createCategoryCardWidgetItem() {
  return {
    id: nanoid(),
    categoryName: "",
    categoryNameColor: "#000000",
    itemCountColor: "#6B7280",
    overlayColor: "",
    shopNowLink: "",
    itemCount: 0,
    backgroundImage: "",
    categoryImage: "",
    order: 0,
    isActive: true,
  };
}
