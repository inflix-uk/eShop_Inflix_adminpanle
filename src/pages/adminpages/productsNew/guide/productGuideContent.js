/**
 * Product guide content — the single source of truth for the full guide page
 * (/admin/product-guide) and the per-tab "How to complete this tab" hints.
 *
 * Plain data only. Field names are the labels exactly as they appear on the
 * New Product / Edit Product pages. Keep this in step with the form: when a
 * label or rule changes in the form, change it here too.
 *
 * Levels:
 *   required    — the form or the shop needs it. `when: "to publish"` means a
 *                 draft can be saved without it, but it must be set before the
 *                 product goes live.
 *   recommended — fill it in for a complete, good-looking listing.
 *   optional    — only when you have the information.
 */

export { COLUMN_GUIDE as EXCEL_COLUMNS } from "../service/productCsvSchema";

export const GUIDE_PATH = "/admin/product-guide";

export const FIELD_LEVELS = {
  required: {
    label: "Required",
    badgeClass: "bg-red-100 text-red-800 ring-1 ring-red-200",
  },
  recommended: {
    label: "Recommended",
    badgeClass: "bg-orange-100 text-orange-800 ring-1 ring-orange-200",
  },
  optional: {
    label: "Optional",
    badgeClass: "bg-gray-100 text-gray-700 ring-1 ring-gray-200",
  },
};

/** Where things are managed. Used for links in the checklists. */
export const ADMIN_LINKS = {
  newProduct: { label: "New Product", path: "/admin/new-product" },
  allProducts: { label: "All Products", path: "/admin/new-products" },
  draftProducts: { label: "Draft Products", path: "/admin/draft-products" },
  productCentral: { label: "Product Central", path: "/admin/product-central" },
  categories: {
    label: "Product Central → Categories",
    path: "/admin/product-central/categories",
  },
  subcategories: {
    label: "Product Central → Subcategories",
    path: "/admin/product-central/subcategories",
  },
  tags: { label: "Product Central → Tags", path: "/admin/product-central/tags" },
  variantAttributes: {
    label: "Variant Attributes",
    path: "/admin/variant-attributes",
  },
  productOptions: { label: "Product Options", path: "/admin/product-options" },
};

/* ------------------------------------------------------------------ */
/* Overview                                                             */
/* ------------------------------------------------------------------ */

export const OVERVIEW = {
  intro:
    "Adding a product is done in two places. The New Product page creates a draft with the basics. The Edit Product page is where you finish everything else, one tab at a time. A product only appears in the shop when you switch Published on in the product list.",
  steps: [
    {
      title: "1. Get the lists ready",
      text: "Make sure the category, brand, condition, colours, storage sizes, accessories and highlights you need already exist. The product form can only pick from these lists; it cannot create them.",
    },
    {
      title: "2. Create the draft",
      text: "Go to New Product. Fill in Basic Information and Pricing & Inventory, then press Save & Continue Editing. Only the Name is needed to save. The product is saved as a draft and the Edit Product page opens.",
    },
    {
      title: "3. Complete the tabs",
      text: "On the Edit Product page work through Images & Media, Product Details, Settings and SEO & Meta. Press Update at the bottom after each tab. Reviews, FAQs and Related Products save themselves as you add items.",
    },
    {
      title: "4. Check it",
      text: "Open the product from the product list using Preview, or the eye icon to check variants. Read it as a customer would: name, price, photos, what's in the box, warranty.",
    },
    {
      title: "5. Publish",
      text: "In All Products (open the brand tile) or Draft Products, switch Published on. Switch it off again to take the product off the shop without deleting it.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Before you start                                                     */
/* ------------------------------------------------------------------ */

export const BEFORE_YOU_START = [
  {
    text: "The category (and subcategory) the product belongs to exists, for example Mobile Phones → iPhone.",
    where: ADMIN_LINKS.categories,
  },
  {
    text: "The brand exists, for example Apple or Samsung. A product cannot be published properly without one.",
    where: ADMIN_LINKS.variantAttributes,
  },
  {
    text: "The condition wording you need exists, for example Brand New or Refurbished.",
    where: ADMIN_LINKS.variantAttributes,
  },
  {
    text: "For a Variant product: every colour, storage size and other option the product comes in exists as a value under the right attribute.",
    where: ADMIN_LINKS.variantAttributes,
  },
  {
    text: "The accessories for What's in the box (Comes With) and the Product highlights (Top Section) you want to tick exist.",
    where: ADMIN_LINKS.productOptions,
  },
  {
    text: "Any tags you want to use exist.",
    where: ADMIN_LINKS.tags,
  },
  {
    text: "Photos are ready: one main photo (thumbnail) plus gallery photos. JPEG, PNG or WebP, each under 10MB. For Variant products, photos per colour if you have them.",
  },
  {
    text: "You have the prices, stock counts and stock codes (SKU, EAN or MPN) written down, one set per colour / storage combination.",
  },
  {
    text: "You have the spec sheet (screen, storage, camera, battery…), what is in the box, the warranty length and the returns period.",
  },
];

/* ------------------------------------------------------------------ */
/* Per-tab field guide                                                  */
/* ------------------------------------------------------------------ */

export const TAB_GUIDE = [
  {
    slug: "basic-information",
    title: "Basic Information",
    purpose:
      "Name the product, file it under the right category, brand and condition, and write the text customers read.",
    fields: [
      {
        name: "Name",
        level: "required",
        how: "The full product name customers search for: brand, model and spec that does not change between variants. Example: Apple iPhone 15 Pro 256GB. For a Variant product leave colour and storage out of the name — they come from the variants. This is the only field needed to save a draft.",
      },
      {
        name: "Generated URL",
        level: "optional",
        how: "Made for you from the name — nothing to type. Check it reads sensibly, for example apple-iphone-15-pro-256gb. On the Edit Product page it is remade every time you change the name, so renaming a live product changes its web address.",
      },
      {
        name: "Categories",
        level: "recommended",
        how: "The shelf the product sits on, for example Mobile Phones or Tablets. Always choose one: a product saved with this empty is uncategorised and does not show on any category page. The list is managed in Product Central → Categories.",
      },
      {
        name: "Subcategories",
        level: "optional",
        how: "A narrower shelf inside the category, for example iPhone inside Mobile Phones. Only the subcategories of the chosen category are offered; you can pick more than one. Called Sub Categories on the Edit Product page.",
      },
      {
        name: "Condition",
        level: "recommended",
        how: "Pick the condition from the list, for example Brand New or Refurbished. On the Edit Product page you can also choose Custom and type your own wording, for example Open box — tested, 99% battery health.",
      },
      {
        name: "Brand",
        level: "required",
        when: "to publish",
        how: "Choose the maker, for example Apple or Samsung. You can save a draft without it, but set it before publishing: products with no brand show a No brand warning and are grouped under Unassigned brand in the product list, so they are hard to find. Brands are managed under Variant Attributes.",
      },
      {
        name: "Tags",
        level: "optional",
        how: "Extra labels used for grouping and search, for example 5G or Student deal. Pick as many as apply. Tags are managed in Product Central → Tags.",
      },
      {
        name: "Main Category",
        level: "optional",
        how: "Edit Product page only. Used for the Google Shopping feed. Leave it empty unless you look after product feeds.",
      },
      {
        name: "Summary",
        level: "recommended",
        how: "Two or three short sentences shown near the price. Lead with what matters: model, storage, condition, what is included. Example: Unlocked iPhone 15 Pro, 256GB. Fully tested, 12-month warranty, charging cable included.",
      },
      {
        name: "Description",
        level: "recommended",
        how: "The full write-up for the product page. Use short paragraphs and bullet points: key features, condition details, what is in the box, who it suits. On the Edit Product page this is a block editor (rows, columns, text, images) — the same editor as the Homepage content.",
      },
    ],
    tips: [
      "Use one naming pattern for every product (Brand + Model + Storage) so the shop looks tidy and search works.",
      "Renaming a live product changes its web address, which breaks links customers may have saved. Fix names while the product is still a draft.",
      "After the first save, open Basic Information on the Edit Product page and check Categories, Brand and Tags are what you intended.",
    ],
  },
  {
    slug: "pricing-inventory",
    title: "Pricing & Inventory",
    purpose:
      "Choose Single or Variant, then enter cost, prices, stock and stock codes — one set for a Single product, one row per option combination for a Variant product.",
    fields: [
      {
        name: "Product Type",
        level: "required",
        how: "Single Product = one price and one stock count (a case, a charger, or a phone sold in one spec only). Variant Product = customers choose options such as colour and storage, and each combination has its own price and stock. New products start as Variant Product — switch to Single Product when there are no options. Turning a saved Variant product back into Single deletes its variants, so only do it when you are sure.",
      },
      {
        name: "Cost",
        level: "optional",
        how: "What you paid for the item. Never shown to customers. Numbers only, for example 450.",
      },
      {
        name: "Price",
        level: "required",
        when: "to publish",
        how: "The normal selling price in pounds, numbers only, no £ sign: 799.00. A product with no price shows as £0 in the shop. When a Sale Price is set, this price is shown crossed out.",
      },
      {
        name: "Sale Price",
        level: "optional",
        how: "Only when the item is on offer. Customers pay this price, so it must be lower than Price. Leave it empty when there is no offer.",
      },
      {
        name: "Quantity",
        level: "required",
        when: "to publish",
        how: "How many you have in stock, as a whole number: 12. Zero shows as out of stock in the shop.",
      },
      {
        name: "SKU",
        level: "recommended",
        how: "Your own stock code, different for every product and every variant, for example IP15P-256-BLU. It is also how the Excel import matches variants when you update a product.",
      },
      {
        name: "EAN",
        level: "optional",
        how: "The 13-digit barcode number printed on the box, for example 0195949037894. Numbers only.",
      },
      {
        name: "MPN",
        level: "optional",
        how: "The manufacturer part or model number, for example SM-S928B for a Samsung Galaxy S24 Ultra.",
      },
      {
        name: "Color",
        level: "optional",
        how: "Single Product only. The colour of the item, for example Black. Used by the Google Shopping export. For a Variant product the colour comes from the variants instead.",
      },
      {
        name: "Product Variants",
        level: "required",
        when: "for Variant products",
        how: "Press Add New Variant, choose an attribute (for example Color), then select the values this product comes in (Black, Blue). Add another variant for Storage (128GB, 256GB). Then press Save inside the Product Variants box — this builds the combinations table below. Without that Save there is nothing to price.",
      },
      {
        name: "Product Price And Stock",
        level: "required",
        when: "for Variant products",
        how: "One row per combination, named from the values, for example black-128gb. Fill Price and Quantity on every row, plus SKU, EAN, MPN and Cost when you have them. The + button on a row opens its photos and meta details. On the Edit Product page tick rows and use Bulk Edit to set the same price or stock on many rows at once; the Status switch hides a combination you no longer sell.",
      },
    ],
    tips: [
      "Variant products: build the variants first (Save in the Product Variants box), then fill the prices in the table.",
      "Do not use one SKU for several variants — every row needs its own.",
      "Sale Price lower than Price. If they are the same, leave Sale Price empty.",
      "On the Edit Product page use the search box and the stock filter above the table to find a variant quickly.",
    ],
  },
  {
    slug: "images-media",
    title: "Images & Media",
    purpose:
      "Add the main photo (thumbnail), the gallery photos and, for Variant products, photos and text per option.",
    fields: [
      {
        name: "Thumbnail",
        level: "recommended",
        how: "The main photo, shown in listings, search results and the basket — the one picture customers always see. Square, product centred on a plain background. JPEG, PNG or WebP, under 10MB. Press Upload from PC or pick one from the Media Library. A product can be saved without it, but do not publish without one.",
      },
      {
        name: "Alt Text",
        level: "optional",
        how: "A plain description of the picture for search engines and screen readers, for example iPhone 15 Pro Blue Titanium, front view. Appears once a thumbnail is set and for each gallery photo you click on.",
      },
      {
        name: "Description",
        level: "optional",
        how: "A short note about the picture. Only needed if the photo shows something worth explaining, for example Light scratch on the back cover.",
      },
      {
        name: "Gallery Images",
        level: "recommended",
        how: "Four to eight extra photos: front, back, sides, screen on, the accessories included, and any marks on refurbished items. Select several at once with Upload from PC, or one at a time from the Media Library. Drag to reorder — the first photo shows first. Click a photo to add its Alt Text and Description; hover and press × to remove it.",
      },
      {
        name: "Variant Images",
        level: "recommended",
        how: "Variant products only. Pick the attribute in the dropdown (usually Color), then press Add under each option to upload that option's photos. Customers see them when they choose that option. You cannot switch to another attribute while photos are attached — remove them first.",
      },
      {
        name: "Variant Description",
        level: "optional",
        how: "Variant products only. A short sentence per option (per colour or per storage) shown when the customer selects it. Pick the attribute, then type under each option.",
      },
    ],
    tips: [
      "Removing a photo deletes it straight away — there is no undo and no need to press Update.",
      "Photos are shrunk automatically when you press Update, so you do not need to resize them first.",
      "Add photos a few at a time and press Update between batches. Saving many large photos in one go can fail with Failed to update product.",
      "Use the same angle and background for every product so the listings look consistent.",
    ],
  },
  {
    slug: "product-details",
    title: "Product Details",
    purpose:
      "List the technical specifications shown in the Specifications table on the product page.",
    fields: [
      {
        name: "Specifications",
        level: "recommended",
        how: "Press Add new for each line. Left box = the name (Screen, Processor, Storage, RAM, Camera, Battery, Connectivity, SIM). Right box = the value (6.1-inch OLED, A17 Pro, 256GB, 8GB, 48MP, 3274 mAh, 5G, Dual SIM). Press Save in the Specifications box when you have finished, then Update at the bottom of the page.",
      },
    ],
    tips: [
      "Keep the same order of lines for every phone or tablet so customers can compare products easily.",
      "Always include the unit: 6.1-inch, 256GB, 5000 mAh, 120Hz.",
      "The bin icon removes a line. Press Save in the box afterwards so the change is kept.",
    ],
  },
  {
    slug: "settings",
    title: "Settings",
    purpose:
      "Switches and extras that change what the product page shows: badges, returns, warranty, low-stock alert, battery upgrade, what is in the box and the highlights.",
    fields: [
      {
        name: "Featured",
        level: "optional",
        how: "Shows the product in the featured sections of the shop. The same switch is in the product list.",
      },
      {
        name: "Verified Refurbished",
        level: "optional",
        how: "Shows the Verified Refurbished badge on the product page. Only switch it on for refurbished items that have been tested.",
      },
      {
        name: "See Accessories",
        level: "optional",
        how: "Adds a See accessories we don't include link on the product page, so customers can check what is not in the box.",
      },
      {
        name: "Perks",
        level: "optional",
        how: "Switch on to show the Perks & Benefits panel on the product page. Press the pencil icon next to it to write the text (and add a picture) that the panel shows.",
      },
      {
        name: "Refundable",
        level: "recommended",
        how: "Switch on if customers can return the item, then enter the number and choose Days or Months, for example 14 Days. A switch that is on with no number tells customers nothing.",
      },
      {
        name: "Warranty",
        level: "recommended",
        how: "Switch on and enter the length, for example 12 Months. Replacement means you replace the item rather than repair it.",
      },
      {
        name: "Low Stock Alert",
        level: "optional",
        how: "The stock level at which the admin panel warns you to reorder, for example 2.",
      },
      {
        name: "Battery Pack",
        level: "optional",
        how: "Phones only. Switch on to offer a new battery as an upgrade on the product page. Price is the extra amount added to the product price when the customer picks it, for example 29.99.",
      },
      {
        name: "What's in the box (Comes With)",
        level: "recommended",
        how: "Tick every accessory that comes with the product, for example Charging Cable, Power Adapter, SIM tool. Customers see the list on the product page. The accessories you can pick from are managed at Product Options.",
      },
      {
        name: "Product highlights (Top Section)",
        level: "recommended",
        how: "Up to 6 short selling points shown near the top of the product page, for example Free next-day delivery, 12-month warranty, 30-day returns. Pick them from the list managed at Product Options.",
      },
      {
        name: "Select Options",
        level: "optional",
        how: "One choice from the Select Options list managed at Product Options. Leave it empty unless you have been told what to pick for this product.",
      },
    ],
    tips: [
      "Press Update at the bottom of the page after changing any switch — nothing here saves on its own.",
      "Refundable and Warranty only make sense with the number filled in.",
      "If What's in the box or Product highlights says nothing has been set up yet, open Product Options, press Set up this list on its card, then add the options there.",
      "A yellow Not recognised box lists saved values that match no option (usually from an Excel import). Tick the right option instead, then press Remove on the old value.",
    ],
  },
  {
    slug: "seo-meta",
    title: "SEO & Meta",
    purpose:
      "Control how the product appears in Google: the title and description in search results, and the picture shown when the link is shared.",
    fields: [
      {
        name: "Meta Title",
        level: "recommended",
        how: "The title shown in Google results. Up to about 60 characters: product name, key spec and condition. Example: iPhone 15 Pro 256GB Refurbished | Unlocked.",
      },
      {
        name: "Meta Description",
        level: "recommended",
        how: "One or two sentences, up to about 155 characters, that make people click: condition, warranty, delivery, price point. Example: Refurbished iPhone 15 Pro 256GB, fully tested with 12-month warranty and free next-day delivery.",
      },
      {
        name: "Meta Keywords",
        level: "optional",
        how: "Search words separated by commas, for example iphone 15 pro, refurbished iphone, 256gb.",
      },
      {
        name: "Meta Schema",
        level: "optional",
        how: "Advanced. Structured-data code for developers. Leave it empty unless you have been given code to paste in.",
      },
      {
        name: "Meta Image",
        level: "optional",
        how: "The picture shown when the product link is shared on social media or messaging apps. Use the thumbnail if unsure. JPEG, PNG or WebP.",
      },
    ],
    tips: [
      "Each variant row also has its own Meta Title, Meta Description, Meta Keywords and Meta Image under the + button on the Pricing & Inventory tab. Fill the product-level ones here first.",
      "Write for people, not robots — a clear sentence beats a list of keywords.",
    ],
  },
  {
    slug: "reviews",
    title: "Reviews",
    purpose:
      "Add and manage the customer reviews shown on the product page. Available on the Edit Product page once the product has been saved.",
    fields: [
      {
        name: "Username",
        level: "optional",
        how: "The reviewer's display name, for example Sarah M.",
      },
      {
        name: "Email",
        level: "optional",
        how: "The reviewer's email. Not shown to customers.",
      },
      {
        name: "Rating (1-5)",
        level: "required",
        how: "A whole number from 1 (poor) to 5 (excellent).",
      },
      {
        name: "Published Date",
        level: "optional",
        how: "The date and time shown on the review. Defaults to now.",
      },
      {
        name: "Comment",
        level: "required",
        how: "The review text in the customer's own words.",
      },
      {
        name: "Status",
        level: "required",
        how: "Approved shows the review on the product page. Pending keeps it hidden until it has been checked. Rejected hides it for good.",
      },
    ],
    tips: [
      "Only add genuine reviews from real customers.",
      "Reviews save as soon as you press Add Review — no Update needed.",
    ],
  },
  {
    slug: "faqs",
    title: "FAQs",
    purpose:
      "Add the questions customers ask about this product, with your answers. Available on the Edit Product page once the product has been saved.",
    fields: [
      {
        name: "Question",
        level: "required",
        how: "Write it the way a customer would ask it, for example Is this phone unlocked to all networks?",
      },
      {
        name: "Answer",
        level: "required",
        how: "A clear, complete answer in one or two short paragraphs.",
      },
      {
        name: "Status",
        level: "optional",
        how: "Published shows the FAQ on the product page. Draft keeps it hidden until you are ready.",
      },
      {
        name: "Export FAQs",
        level: "optional",
        how: "Downloads this product's FAQs as a spreadsheet with question, answer and status columns, plus an Instructions sheet. Use it as a template.",
      },
      {
        name: "Import FAQs",
        level: "optional",
        how: "Adds new FAQs from a spreadsheet with question, answer and status columns. Questions that already exist on the product are skipped, and nothing is changed or deleted. You confirm a summary before anything is added.",
      },
    ],
    tips: [
      "Three to six good questions are enough: Is it unlocked? What is in the box? What condition is it in? What warranty does it have? Can I return it?",
      "Use Export FAQs on a finished product, then Import FAQs on similar products to reuse the same questions.",
    ],
  },
  {
    slug: "related-products",
    title: "Related Products",
    purpose:
      "Choose other products to suggest on this product's page. Available on the Edit Product page once the product has been saved.",
    fields: [
      {
        name: "Search & Add Related Products",
        level: "recommended",
        how: "Type at least three letters of a product name, then click a result to add it. Pick three to six items that go with this one: a case, a charger, the same phone in another storage size, or the next model up.",
      },
    ],
    tips: [
      "Related products are saved as soon as you add or remove them — no Update needed.",
      "Only link products that are published, or customers will see suggestions they cannot buy.",
    ],
  },
];

/** Tabs that are locked on the New Product page and only work on the Edit Product page. */
export const EDIT_ONLY_TABS = [
  "images-media",
  "product-details",
  "settings",
  "seo-meta",
  "reviews",
  "faqs",
  "related-products",
];

/* ------------------------------------------------------------------ */
/* Step-by-step walkthrough (one entry per tab, keyed by slug)          */
/* ------------------------------------------------------------------ */

export const WALKTHROUGH = [
  {
    slug: "basic-information",
    where: "New Product page (and later the Edit Product page)",
    steps: [
      "Type the Name. Watch the Generated URL appear underneath — it is the product's web address.",
      "Choose the category in Categories, then any Subcategories that apply.",
      "Choose the Condition.",
      "Choose the Brand. You can skip it for now, but it must be set before you publish.",
      "Add Tags if you use them.",
      "Write the Summary (two or three sentences) and the Description (the full write-up).",
      "Move to the Pricing & Inventory tab. Nothing is saved yet.",
    ],
  },
  {
    slug: "pricing-inventory",
    where: "New Product page (and later the Edit Product page)",
    steps: [
      "Choose the Product Type. Single Product for one price and one stock count; Variant Product when customers choose options.",
    ],
    single: [
      "Fill in Price and Quantity. Add Cost, Sale Price, SKU, EAN, MPN and Color if you have them.",
      "Press Save & Continue Editing at the bottom. The draft is saved and the Edit Product page opens with all tabs unlocked.",
    ],
    variant: [
      "In the Product Variants box press Add New Variant and choose an attribute, for example Color.",
      "Select the values this product comes in, for example Black and Blue. For attributes that have models, pick the models under each value.",
      "Press Add New Variant again for the next attribute, for example Storage, and select its values.",
      "Press Save inside the Product Variants box. The Product Price And Stock table fills with one row per combination, for example black-128gb, black-256gb, blue-128gb, blue-256gb.",
      "On every row enter Price and Quantity, plus Cost, Sale Price, SKU, EAN and MPN when known. The + button on a row opens its own photos and meta fields.",
      "Press Save & Continue Editing at the bottom. The draft is saved and the Edit Product page opens with all tabs unlocked.",
    ],
    after: [
      "On the Edit Product page, variants work the same way: change values in the Product Variants box, press Save there, then fix the table and press Update.",
      "To stop selling one combination, switch its Status off in the table instead of deleting it.",
    ],
  },
  {
    slug: "images-media",
    where: "Edit Product page only",
    steps: [
      "Under Thumbnail press Upload from PC (or Media Library) and choose the main photo. Fill in its Alt Text.",
      "Under Gallery Images press Upload from PC and select the extra photos together. Drag them into the order you want.",
      "Click a gallery photo to add its Alt Text and Description, then press ✕ to close the details.",
      "Press Update at the bottom of the page.",
    ],
    variant: [
      "In the Variant Images box choose the attribute (usually Color) in the dropdown.",
      "Under each option press Add and choose that option's photos.",
      "In the Variant Description box choose the attribute and type a short sentence under each option if you want one.",
      "Press Update.",
    ],
  },
  {
    slug: "product-details",
    where: "Edit Product page only",
    steps: [
      "Press Add new once for each specification line.",
      "Type the name in the left box and the value in the right box, for example Screen and 6.1-inch OLED.",
      "Press Save in the Specifications box.",
      "Press Update at the bottom of the page.",
    ],
  },
  {
    slug: "settings",
    where: "Edit Product page only",
    steps: [
      "In Product Toggles switch on what applies: Featured, Verified Refurbished, See Accessories, Perks (press the pencil to write the perks text).",
      "Switch on Refundable and enter the period, for example 14 and Days.",
      "Switch on Warranty and enter the length, for example 12 and Months. Switch on Replacement if you replace rather than repair.",
      "Enter the Low Stock Alert quantity if you want a reorder warning.",
      "Phones: switch on Battery Pack and enter the extra Price if you offer a new battery.",
      "In What's in the box (Comes With) tick every accessory included.",
      "In Product highlights (Top Section) pick up to 6 highlights.",
      "Pick a Select Options entry only if you have been told to.",
      "Press Update at the bottom of the page.",
    ],
  },
  {
    slug: "seo-meta",
    where: "Edit Product page only",
    steps: [
      "Write the Meta Title (about 60 characters).",
      "Write the Meta Description (about 155 characters).",
      "Add Meta Keywords separated by commas if you use them.",
      "Leave Meta Schema empty unless you have been given code.",
      "Upload a Meta Image if you want a specific picture when the link is shared.",
      "Press Update at the bottom of the page.",
    ],
  },
  {
    slug: "reviews",
    where: "Edit Product page only",
    steps: [
      "Press Add Review.",
      "Fill in Rating (1-5) and Comment. Add Username, Email and Published Date if you have them.",
      "Choose the Status: Approved to show it, Pending to hold it.",
      "Press Add Review in the window. It is saved immediately.",
    ],
  },
  {
    slug: "faqs",
    where: "Edit Product page only",
    steps: [
      "Press Add FAQ.",
      "Type the Question and the Answer. Choose Published or Draft.",
      "Press Add FAQ in the window. It is saved immediately.",
      "To add many at once: press Export FAQs to get the spreadsheet, fill one row per FAQ, then press Import FAQs and confirm the summary.",
    ],
  },
  {
    slug: "related-products",
    where: "Edit Product page only",
    steps: [
      "In Search & Add Related Products type at least three letters of the other product's name.",
      "Click the product in the results to add it. Repeat for three to six products.",
      "Use the remove button on a card to take a product off the list. Changes are saved immediately.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Publishing checklist                                                 */
/* ------------------------------------------------------------------ */

export const PUBLISHING_CHECKLIST = [
  { text: "Name is correct and the Generated URL reads sensibly.", slug: "basic-information" },
  { text: "Categories and Brand are chosen — the product list shows no No brand warning.", slug: "basic-information" },
  { text: "Condition is set.", slug: "basic-information" },
  { text: "Summary and Description are written.", slug: "basic-information" },
  { text: "Every variant row (or the single product) has a Price and a Quantity. Sale Price is lower than Price or empty.", slug: "pricing-inventory" },
  { text: "Every variant row has its own SKU.", slug: "pricing-inventory" },
  { text: "Thumbnail is set and there are gallery photos. Variant products have photos per colour.", slug: "images-media" },
  { text: "Specifications are filled in.", slug: "product-details" },
  { text: "Warranty and Refundable are switched on with a period, What's in the box and Product highlights are ticked.", slug: "settings" },
  { text: "Meta Title and Meta Description are written.", slug: "seo-meta" },
  { text: "Update has been pressed on the Edit Product page and the page shows the latest changes after reloading.", slug: "settings" },
  { text: "Preview from the product list looks right on screen.", slug: "publishing" },
];

export const PUBLISH_STEPS = [
  "Go to All Products and open the brand tile (or the Unassigned brand tile if you forgot the brand — fix the brand first). Drafts are also listed under the Draft Products tab.",
  "Find the product in the table. Use the search box if the list is long.",
  "Switch Published on. The product is live in the shop straight away.",
  "Switch Featured on only if the product should appear in the featured sections.",
  "Open Preview to see the product page as customers see it.",
  "To take a product off the shop, switch Published off. It is kept as a draft. Delete moves it to Deleted Products.",
];

/* ------------------------------------------------------------------ */
/* Excel import and export                                              */
/* ------------------------------------------------------------------ */

export const IMPORT_EXPORT = {
  intro:
    "Spreadsheets are the quickest way to add or update many products, copy a product between shops, or reuse FAQs. Every import shows you a preview and asks you to confirm before anything is written.",
  sections: [
    {
      title: "Many products at once (All Products page)",
      buttons: "Export Excel and Import, at the top of the All Products page.",
      steps: [
        "Press Export Excel. Open a brand first if you want that brand's products included; otherwise you get the template only.",
        "The file has three sheets: Products (one row per variant, with dropdowns), Reference (the allowed values) and Instructions (how to fill it in).",
        "Fill or change the Products sheet. The grey sample- rows at the top show the format and are always ignored.",
        "Keep the producturl column: rows with the same producturl belong to one product. A producturl that already exists updates that product; blank cells keep what is stored.",
        "Press Import, choose the .xlsx or .csv file, read the preview (created / updated / failed) and confirm.",
      ],
    },
    {
      title: "One product (Edit Product page)",
      buttons:
        "Export this product and Import into this product, at the top of the Edit Product page. Each row of the product list also has an Export action.",
      steps: [
        "Press Export this product to download that product (all its variants) in the same Excel format.",
        "Change the cells you need. Keep the producturl column exactly as it is — that is how the file finds the product.",
        "Press Import into this product and choose the file. Only this product is updated; other products in the file are ignored and no new product is ever created from here.",
        "Press Update first if you have unsaved changes on the page — they are lost when the import reloads the product.",
      ],
    },
    {
      title: "FAQs (FAQs tab on the Edit Product page)",
      buttons: "Export FAQs and Import FAQs, on the FAQs tab.",
      steps: [
        "Press Export FAQs to get a spreadsheet with question, answer and status columns (and an Instructions sheet).",
        "Add one row per FAQ. Keep the header row as it is. status is Published or Draft; blank means Published.",
        "Press Import FAQs and choose the file. New questions are added after the existing ones; questions already on the product are skipped. Nothing is changed or deleted.",
      ],
    },
  ],
  rules: [
    "One row per variant. A Single product is one row with variant_attributes empty.",
    "Cells with several values use the | character between them, never a comma: tag1|tag2.",
    "Prices are numbers only: 19.99.",
    "Images travel as https:// links and are used as-is, so the links must stay online. You can add photos in the product form afterwards instead.",
    "Do not rename or reorder the header row.",
    "Variants are matched by SKU first, then by name — keep SKUs stable when you re-import.",
  ],
  notCarried:
    "Battery option, warranty, refund period, perks, Select Options, meta image and meta schema, block-based descriptions, photos per option, related products, reviews and FAQs are not carried by the product spreadsheet. Import the product first, then finish those tabs on the Edit Product page (FAQs have their own spreadsheet on the FAQs tab).",
};

/* ------------------------------------------------------------------ */
/* Common mistakes                                                      */
/* ------------------------------------------------------------------ */

export const COMMON_MISTAKES = [
  {
    problem: "The Images, Settings, SEO and other tabs are greyed out on the New Product page.",
    fix: "That is normal. Fill in Basic Information and Pricing & Inventory, press Save & Continue Editing, and the Edit Product page opens with every tab unlocked.",
  },
  {
    problem: "The Publish button on the New Product page is greyed out.",
    fix: "Publishing is done from the product list: All Products (open the brand tile) or Draft Products, then switch Published on.",
  },
  {
    problem: "The Product Price And Stock table is empty for a Variant product.",
    fix: "You chose the values but did not press Save inside the Product Variants box. Press it and the rows appear.",
  },
  {
    problem: "The product shows £0 in the shop.",
    fix: "One or more variants (or the single product) has no Price. Open Pricing & Inventory, fill Price on every row and press Update.",
  },
  {
    problem: "The product is not under its brand in All Products and shows a No brand warning.",
    fix: "Brand was left empty. Open it from the Unassigned brand tile, set the Brand on Basic Information and press Update.",
  },
  {
    problem: "A photo will not upload.",
    fix: "Only JPEG, PNG and WebP files under 10MB are accepted. Convert or shrink the photo and try again.",
  },
  {
    problem: "Changes disappeared after leaving the page.",
    fix: "Press Update at the bottom of the Edit Product page. Save inside the Specifications or Product Variants boxes only prepares that box; Update saves the product.",
  },
  {
    problem: "Update fails with Failed to update product after adding photos.",
    fix: "Too many large photos in one go. Add a few at a time and press Update between batches.",
  },
  {
    problem: "The product's web address changed and old links stopped working.",
    fix: "The address is made from the Name and is remade when the name changes. Avoid renaming live products; fix names while the product is a draft.",
  },
  {
    problem: "Saving a new product fails with A product with this producturl already exists.",
    fix: "Another product has the same name. Make the name different, for example add the storage size or the year.",
  },
  {
    problem: "An older product is in the wrong category or has a tag it should not have.",
    fix: "Products added before this was fixed could be saved with the first category and tag in the list when those boxes were left empty. Open Basic Information on the Edit Product page, correct Categories and Tags and press Update.",
  },
  {
    problem: "All the variants disappeared.",
    fix: "The Product Type was switched from Variant Product to Single Product, which deletes the variants after a warning. This cannot be undone — rebuild the variants in Pricing & Inventory.",
  },
  {
    problem: "Excel import says Missing the producturl column.",
    fix: "The file was not made with Export. Press Export Excel (or Export this product) first and fill in that file.",
  },
  {
    problem: "Excel import created nothing.",
    fix: "Only the sample- template rows were in the file. Replace them with real rows that have their own producturl.",
  },
];
