import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Editor } from "@tinymce/tinymce-react";
import BlockEditor from "../../pages/adminpages/blog-new/components/createblog/BlockEditor/BlockEditor";

const tinymceInit = {
  height: 500,
  menubar: true,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "code",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "help",
    "wordcount",
  ],
  toolbar:
    "undo redo | blocks fontsize | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | table | removeformat | code",
  table_toolbar:
    "tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } li > h1, li > h2, li > h3, li > h4, li > h5, li > h6 { display: inline; margin: 0; }",
};

export default function ProductDescription({
  product,
  setProduct,
  summaryEditor,
  descriptionEditor,
}) {
  const summaryEditorRef = useRef(null);

  const descriptionBlocks = Array.isArray(product?.Product_description_blocks)
    ? product.Product_description_blocks
    : [];

  const setDescriptionBlocks = (next) => {
    setProduct((prev) => {
      const resolved =
        typeof next === "function"
          ? next(
              Array.isArray(prev.Product_description_blocks)
                ? prev.Product_description_blocks
                : []
            )
          : next;
      return {
        ...prev,
        Product_description_blocks: resolved,
      };
    });
  };

  useEffect(() => {
    if (descriptionEditor) {
      descriptionEditor.current = {
        getContent: () => {
          if (descriptionBlocks.length > 0) return "";
          return product?.Product_description || "";
        },
      };
    }
  }, [descriptionEditor, descriptionBlocks.length, product?.Product_description]);

  return (
    <>
      <div className="px-0  shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 space-y-5">
          <div className="flex flex-col space-y-2">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Summary
            </h2>
            <div className="w-full">
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                licenseKey="gpl"
                onInit={(evt, editor) => {
                  summaryEditorRef.current = editor;
                  if (summaryEditor) summaryEditor.current = editor;
                }}
                value={product?.Product_summary || ""}
                init={tinymceInit}
                onEditorChange={(newContent) => {
                  setProduct((prev) => ({
                    ...prev,
                    Product_summary: newContent,
                  }));
                }}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Description
            </h2>
            <p className="text-sm text-gray-500">
              Build the product description with rows, columns, text, images, widgets,
              and product sliders — same editor as{" "}
              <span className="font-medium text-gray-700">Homepage content</span> in
              settings. The storefront shows this layout when rows exist; otherwise it
              falls back to the legacy HTML field below.
            </p>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-2 sm:p-4">
              <BlockEditor
                blocks={descriptionBlocks}
                setBlocks={setDescriptionBlocks}
                className="p-0 sm:p-2"
              />
            </div>
            {product?.Product_description?.trim() &&
            descriptionBlocks.length === 0 ? (
              <details className="rounded-md border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900">
                <summary className="cursor-pointer font-medium">
                  Legacy HTML description (read-only — not shown on store once you add
                  content rows)
                </summary>
                <div
                  className="prose prose-sm mt-2 max-h-48 overflow-y-auto border border-amber-100 bg-white p-2"
                  dangerouslySetInnerHTML={{
                    __html: product.Product_description,
                  }}
                />
              </details>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

ProductDescription.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
  summaryEditor: PropTypes.object.isRequired,
  descriptionEditor: PropTypes.object.isRequired,
};
