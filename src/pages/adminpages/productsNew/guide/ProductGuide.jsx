import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  OVERVIEW,
  BEFORE_YOU_START,
  TAB_GUIDE,
  EDIT_ONLY_TABS,
  WALKTHROUGH,
  PUBLISHING_CHECKLIST,
  PUBLISH_STEPS,
  IMPORT_EXPORT,
  EXCEL_COLUMNS,
  COMMON_MISTAKES,
  FIELD_LEVELS,
  ADMIN_LINKS,
} from "./productGuideContent";

const SECTIONS = [
  { id: "overview", title: "How it works" },
  { id: "before-you-start", title: "Before you start" },
  { id: "quick-reference", title: "Every field at a glance" },
  ...TAB_GUIDE.map((tab, index) => ({
    id: tab.slug,
    title: `Step ${index + 1}: ${tab.title}`,
  })),
  { id: "publishing", title: "Publishing checklist" },
  { id: "import-export", title: "Excel import and export" },
  { id: "common-mistakes", title: "Common mistakes" },
];

/** First sentence of a field's "how" text, for the quick-reference table. */
function firstSentence(text) {
  const match = String(text || "").match(/^[^.]*\.(?=\s|$)/);
  return match ? match[0] : text;
}

function LevelBadge({ level, when }) {
  const meta = FIELD_LEVELS[level] || FIELD_LEVELS.optional;
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}
    >
      {meta.label}
      {when ? <span className="ml-1 normal-case tracking-normal font-medium">{when}</span> : null}
    </span>
  );
}

LevelBadge.propTypes = {
  level: PropTypes.oneOf(Object.keys(FIELD_LEVELS)).isRequired,
  when: PropTypes.string,
};

function Section({ id, title, lead, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6 print:shadow-none print:ring-0 print:p-0 print:break-inside-avoid-page"
    >
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {lead ? <p className="mt-1 text-sm text-gray-600">{lead}</p> : null}
      <div className="mt-4 space-y-4 text-sm text-gray-800">{children}</div>
    </section>
  );
}

Section.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  lead: PropTypes.string,
  children: PropTypes.node,
};

function NumberedSteps({ steps }) {
  return (
    <ol className="list-decimal space-y-1.5 pl-5">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  );
}

NumberedSteps.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function FieldList({ fields }) {
  return (
    <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
      {fields.map((field) => (
        <div key={field.name} className="grid gap-1 px-3 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-4 print:break-inside-avoid">
          <dt className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-start">
            <span className="font-semibold text-gray-900">{field.name}</span>
            <LevelBadge level={field.level} when={field.when} />
          </dt>
          <dd className="text-gray-700">{field.how}</dd>
        </div>
      ))}
    </dl>
  );
}

FieldList.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      level: PropTypes.string.isRequired,
      when: PropTypes.string,
      how: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default function ProductGuide() {
  const [selectedPage, setSelectedPage] = useState("product-guide");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => setIsSidebarOpen(false);

  // The page is lazy-loaded, so the browser's own jump to #slug happens before
  // the content exists. Repeat it once the sections are on the page.
  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target) target.scrollIntoView({ block: "start" });
  }, []);

  const handlePrint = () => window.print();

  return (
    <>
      <Helmet>
        <title>Product Guide</title>
      </Helmet>
      <div className="print:hidden">
        <Side
          selectedPage={selectedPage}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          closeSidebar={closeSidebar}
        />
      </div>
      <div className={`lg:pl-72 print:pl-0 ${isSidebarOpen ? "pl-0" : ""}`}>
        <div className="sticky top-0 z-30 print:hidden">
          <Top
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            selectedPage={selectedPage}
            setSelectedPage={setSelectedPage}
          />
        </div>
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="my-6 flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Product guide: how to add a product correctly
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Everything needed to add a phone, tablet or accessory to the shop, tab by tab,
                  with every field marked Required, Recommended or Optional. Keep it open next to
                  the product form, or print it.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" />
                  </svg>
                  Print / save as PDF
                </button>
                <Link
                  to={ADMIN_LINKS.newProduct.path}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                >
                  Add a new product
                </Link>
                <Link
                  to={ADMIN_LINKS.allProducts.path}
                  className="inline-flex items-center rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  All Products
                </Link>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
              {/* Table of contents */}
              <nav
                aria-label="Guide contents"
                className="hidden lg:block lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto print:hidden"
              >
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Contents
                </p>
                <ul className="mt-2 space-y-0.5 text-sm">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-md px-3 py-1.5 text-gray-700 hover:bg-white hover:text-primary"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Content */}
              <div className="space-y-6">
                {/* Mobile contents */}
                <details className="rounded-lg border border-gray-200 bg-white p-3 text-sm lg:hidden print:hidden">
                  <summary className="cursor-pointer font-semibold text-gray-900">Contents</summary>
                  <ul className="mt-2 space-y-1">
                    {SECTIONS.map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`} className="text-primary hover:underline">
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>

                {/* Overview */}
                <Section id="overview" title="How it works" lead={OVERVIEW.intro}>
                  <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {OVERVIEW.steps.map((step) => (
                      <li key={step.title} className="rounded-lg border border-gray-200 bg-gray-50 p-3 print:break-inside-avoid">
                        <p className="font-semibold text-gray-900">{step.title}</p>
                        <p className="mt-1 text-gray-700">{step.text}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-gray-800">
                    <p className="font-semibold text-blue-800">Two product types</p>
                    <p className="mt-1">
                      <span className="font-semibold">Single Product</span> — one price and one stock
                      count. Use it for cases, chargers, cables, or a device sold in one spec only.
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Variant Product</span> — the customer chooses
                      options such as colour and storage, and every combination (for example
                      black-128gb) has its own price, stock and stock code. Use it for phones and
                      tablets that come in several colours or sizes.
                    </p>
                  </div>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-gray-800">
                    <p className="font-semibold text-yellow-800">What the buttons do</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      <li>
                        <span className="font-semibold">Save &amp; Continue Editing</span> (New Product
                        page) saves the product as a draft and opens the Edit Product page. Only the
                        Name is needed. The Publish button on that page is always greyed out on
                        purpose.
                      </li>
                      <li>
                        <span className="font-semibold">Update</span> (Edit Product page) saves
                        everything on every tab. Press it after each tab you finish.
                      </li>
                      <li>
                        <span className="font-semibold">Save</span> inside the Product Variants and
                        Specifications boxes only prepares that box. You still need Update.
                      </li>
                      <li>
                        <span className="font-semibold">Published</span> switch (product list) puts the
                        product in the shop or takes it out. <span className="font-semibold">Featured</span>{" "}
                        adds it to the featured sections.
                      </li>
                    </ul>
                  </div>
                </Section>

                {/* Before you start */}
                <Section
                  id="before-you-start"
                  title="Before you start"
                  lead="The product form can only choose from lists that already exist. Check these first so you do not have to stop halfway."
                >
                  <ul className="space-y-2">
                    {BEFORE_YOU_START.map((item) => (
                      <li key={item.text} className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white" aria-hidden="true" />
                        <span className="flex-1">
                          {item.text}
                          {item.where ? (
                            <>
                              {" "}
                              <Link to={item.where.path} className="whitespace-nowrap text-primary hover:underline print:hidden">
                                Manage in {item.where.label}
                              </Link>
                              <span className="hidden print:inline text-gray-500"> ({item.where.label})</span>
                            </>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Section>

                {/* Quick reference */}
                <Section
                  id="quick-reference"
                  title="Every field at a glance"
                  lead="All fields grouped by tab. Required fields must be filled in; the ones marked 'to publish' can be left while the product is a draft."
                >
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.entries(FIELD_LEVELS).map(([key, meta]) => (
                      <span key={key} className={`rounded px-2 py-1 font-semibold ${meta.badgeClass}`}>
                        {meta.label}
                      </span>
                    ))}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        <tr>
                          <th scope="col" className="px-3 py-2">Field</th>
                          <th scope="col" className="px-3 py-2">Level</th>
                          <th scope="col" className="px-3 py-2">What to enter</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {TAB_GUIDE.map((tab, index) => (
                          <TabRows key={tab.slug} tab={tab} index={index} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                {/* Step-by-step walkthrough */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Step-by-step walkthrough</p>
                  <p className="mt-1">
                    One section per tab, in the order the tabs appear. Steps 1 and 2 are done on the
                    New Product page; steps 3 to 9 only open on the Edit Product page after Save
                    &amp; Continue Editing.
                  </p>
                </div>

                {TAB_GUIDE.map((tab, index) => {
                  const walk = WALKTHROUGH.find((entry) => entry.slug === tab.slug);
                  const editOnly = EDIT_ONLY_TABS.includes(tab.slug);
                  return (
                    <Section
                      key={tab.slug}
                      id={tab.slug}
                      title={`Step ${index + 1}: ${tab.title}`}
                      lead={tab.purpose}
                    >
                      <p className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        <span className="font-semibold">Where:</span> {walk?.where || "Edit Product page"}
                        {editOnly ? " · locked on the New Product page until the first save" : ""}
                      </p>

                      {walk?.steps?.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900">What to do</h3>
                          <div className="mt-1.5">
                            <NumberedSteps steps={walk.steps} />
                          </div>
                        </div>
                      )}

                      {(walk?.single || walk?.variant) && (
                        <div className="grid gap-4 md:grid-cols-2">
                          {walk.single && (
                            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                              <h3 className="font-semibold text-teal-800">Single Product</h3>
                              <div className="mt-1.5">
                                <NumberedSteps steps={walk.single} />
                              </div>
                            </div>
                          )}
                          {walk.variant && (
                            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                              <h3 className="font-semibold text-indigo-800">Variant Product</h3>
                              <div className="mt-1.5">
                                <NumberedSteps steps={walk.variant} />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {walk?.after?.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 text-gray-700">
                          {walk.after.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      )}

                      <div>
                        <h3 className="font-semibold text-gray-900">The fields on this tab</h3>
                        <div className="mt-1.5">
                          <FieldList fields={tab.fields} />
                        </div>
                      </div>

                      {tab.tips?.length > 0 && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                          <h3 className="font-semibold text-yellow-800">Tips</h3>
                          <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-800">
                            {tab.tips.map((tip) => (
                              <li key={tip}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Section>
                  );
                })}

                {/* Publishing */}
                <Section
                  id="publishing"
                  title="Publishing checklist"
                  lead="Go through this list before switching Published on. Each line says which tab to check."
                >
                  <ul className="space-y-2">
                    {PUBLISHING_CHECKLIST.map((item) => (
                      <li key={item.text} className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 bg-white" aria-hidden="true" />
                        <span className="flex-1">
                          {item.text}{" "}
                          <a href={`#${item.slug}`} className="whitespace-nowrap text-xs text-primary hover:underline print:hidden">
                            {SECTIONS.find((s) => s.id === item.slug)?.title || "See above"}
                          </a>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <h3 className="font-semibold text-gray-900">How to publish</h3>
                    <div className="mt-1.5">
                      <NumberedSteps steps={PUBLISH_STEPS} />
                    </div>
                  </div>
                </Section>

                {/* Import / export */}
                <Section id="import-export" title="Importing and exporting with Excel" lead={IMPORT_EXPORT.intro}>
                  <div className="grid gap-4 lg:grid-cols-3">
                    {IMPORT_EXPORT.sections.map((section) => (
                      <div key={section.title} className="rounded-lg border border-gray-200 p-3 print:break-inside-avoid">
                        <h3 className="font-semibold text-gray-900">{section.title}</h3>
                        <p className="mt-1 text-xs text-gray-600">Buttons: {section.buttons}</p>
                        <div className="mt-2">
                          <NumberedSteps steps={section.steps} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <h3 className="font-semibold text-blue-800">Rules for the product spreadsheet</h3>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {IMPORT_EXPORT.rules.map((rule) => (
                          <li key={rule}>{rule}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                      <h3 className="font-semibold text-orange-800">Not carried by the spreadsheet</h3>
                      <p className="mt-1">{IMPORT_EXPORT.notCarried}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Every column in the product spreadsheet</h3>
                    <p className="mt-1 text-xs text-gray-600">
                      Product columns are read from the first row of each product only; variant
                      columns are read from every row. This is the same list as the Instructions
                      sheet inside the exported file.
                    </p>
                    <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
                      <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50 text-left font-semibold uppercase tracking-wide text-gray-600">
                          <tr>
                            <th scope="col" className="px-3 py-2">Column</th>
                            <th scope="col" className="px-3 py-2">Applies to</th>
                            <th scope="col" className="px-3 py-2">Required?</th>
                            <th scope="col" className="px-3 py-2">How to fill it</th>
                            <th scope="col" className="px-3 py-2">Example</th>
                            <th scope="col" className="px-3 py-2">In the form</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {EXCEL_COLUMNS.map((col) => (
                            <tr key={col.key} className="align-top">
                              <td className="whitespace-nowrap px-3 py-2 font-mono font-semibold text-gray-900">{col.key}</td>
                              <td className="whitespace-nowrap px-3 py-2">{col.level === "product" ? "Product" : "Variant"}</td>
                              <td className={`px-3 py-2 ${/REQUIRED/.test(col.required) ? "font-semibold text-red-700" : "text-gray-700"}`}>
                                {col.required}
                              </td>
                              <td className="px-3 py-2 text-gray-700">{col.howToFill}</td>
                              <td className="px-3 py-2 font-mono text-gray-700">{col.example}</td>
                              <td className="px-3 py-2 text-gray-600">{col.formLocation}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Section>

                {/* Common mistakes */}
                <Section id="common-mistakes" title="Common mistakes and how to fix them">
                  <dl className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                    {COMMON_MISTAKES.map((item) => (
                      <div key={item.problem} className="grid gap-1 px-3 py-2.5 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-4 print:break-inside-avoid">
                        <dt className="font-semibold text-gray-900">{item.problem}</dt>
                        <dd className="text-gray-700">{item.fix}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>

                <p className="pb-6 text-center text-xs text-gray-500 print:hidden">
                  Something in this guide does not match the form? Tell the admin team so the guide
                  can be updated.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function TabRows({ tab, index }) {
  return (
    <>
      <tr className="bg-gray-50">
        <th scope="colgroup" colSpan={3} className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          <a href={`#${tab.slug}`} className="hover:text-primary hover:underline">
            {index + 1}. {tab.title}
          </a>
          {EDIT_ONLY_TABS.includes(tab.slug) ? (
            <span className="ml-2 text-xs font-normal text-gray-500">Edit Product page</span>
          ) : null}
        </th>
      </tr>
      {tab.fields.map((field) => (
        <tr key={`${tab.slug}-${field.name}`} className="align-top">
          <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">{field.name}</td>
          <td className="whitespace-nowrap px-3 py-2">
            <LevelBadge level={field.level} when={field.when} />
          </td>
          <td className="px-3 py-2 text-gray-700">{firstSentence(field.how)}</td>
        </tr>
      ))}
    </>
  );
}

TabRows.propTypes = {
  tab: PropTypes.shape({
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};
