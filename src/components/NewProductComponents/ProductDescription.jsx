import { useRef } from "react";
import PropTypes from "prop-types";
import { Editor } from "@tinymce/tinymce-react";

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
  summary,
  summaryEditor,
  setSummary,
  description,
  descriptionEditor,
  setDescription,
}) {
  const summaryEditorRef = useRef(null);
  const descriptionEditorRef = useRef(null);

  return (
    <>
      <div className=" px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 space-y-5">
          {/* Summary Section */}
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
                value={summary || ""}
                init={tinymceInit}
                onEditorChange={(newContent) => setSummary(newContent)}
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="flex flex-col space-y-2">
            <h2 className="text-base font-semibold leading-6 text-gray-900">
              Description
            </h2>
            <div className="w-full">
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                licenseKey="gpl"
                onInit={(evt, editor) => {
                  descriptionEditorRef.current = editor;
                  if (descriptionEditor) descriptionEditor.current = editor;
                }}
                value={description || ""}
                init={tinymceInit}
                onEditorChange={(newContent) => setDescription(newContent)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ProductDescription.propTypes = {
  summary: PropTypes.string.isRequired,
  summaryEditor: PropTypes.object.isRequired,
  setSummary: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
  descriptionEditor: PropTypes.object.isRequired,
  setDescription: PropTypes.func.isRequired,
};
