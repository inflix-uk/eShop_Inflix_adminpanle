/** TinyMCE config aligned with blog TextBlock editor (compact for modal). */
export const tinymcePackageDescriptionInit = {
  height: 280,
  menubar: false,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'charmap',
    'preview',
    'searchreplace',
    'visualblocks',
    'code',
    'fullscreen',
    'table',
    'help',
    'wordcount',
  ],
  toolbar:
    'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link | removeformat | code',
  content_style:
    'body { font-family:Helvetica,Arial,sans-serif; font-size:14px } li > h1, li > h2, li > h3, li > h4, li > h5, li > h6 { display: inline; margin: 0; }',
  branding: false,
  promotion: false,
};
