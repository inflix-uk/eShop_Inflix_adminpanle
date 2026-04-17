import { nanoid } from "nanoid";

export function defaultBannerContent() {
  return {
    title: "",
    titleColor: "#FFFFFF",
    titleSize: "24px",
    subtitle: "",
    subtitleColor: "#FFFFFF",
    subtitleSize: "32px",
    paragraph: "",
    paragraphColor: "#FFFFFF",
    paragraphSize: "18px",
    price: "",
    priceColor: "#FF0000",
    priceSize: "20px",
    warranty: [],
    buynow: "",
    sellnow: "",
    textAlign: "left",
    textPosition: "right",
  };
}

/** One banner slide stored in a siteBanners widget block (mirrors Banners admin shape). */
export function createBannerWidgetItem() {
  return {
    id: nanoid(),
    type: "simple",
    imageLarge: "",
    imageSmall: "",
    extraImage: "",
    altText: "",
    buttonText: "",
    buttonLink: "",
    content: defaultBannerContent(),
    order: 0,
    isActive: true,
  };
}
