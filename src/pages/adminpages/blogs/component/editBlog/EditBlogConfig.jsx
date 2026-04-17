// EditBlogConfig.jsx
// JoditEditor configuration extracted from EditBlog.jsx (lines 12-96)

const config = {
    buttons: [
        'source', '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'eraser',
        'superscript',
        'subscript', '|',
        'ul',
        'ol',
        'outdent',
        'indent', '|',
        'font',
        'fontsize',
        'brush',
        'paragraph', '|',
        'image',
        'table',
        'link',
        'align', '|',
        'undo',
        'redo', '|',
        'hr',
        'copyformat',
        'fullsize',
        'print',
        'about',
    ],
    controls: {
        font: {
            list: {
                'Roboto,Arial,sans-serif': 'Roboto',
                'Lato,Arial,sans-serif': 'Lato',
                'Montserrat,Arial,sans-serif': 'Montserrat',
                'Merriweather,Georgia,serif': 'Merriweather',
                'Arial,sans-serif': 'Arial',
                'Georgia,serif': 'Georgia',
            },
        },
        fontsize: {
            list: [
                '8', '9', '10', '11', '12', '14', '16', '18', '20',
                '22', '24', '26', '28', '36', '48', '60', '72', '96',
            ],
        },
        paragraph: {
            list: {
                'p': 'Normal',
                'h1': 'Heading 1',
                'h2': 'Heading 2',
                'h3': 'Heading 3',
                'h4': 'Heading 4',
                'h5': 'Heading 5',
                'h6': 'Heading 6',
            },
        },
        ul: {
            tooltip: 'Unordered List',
            list: {
                'disc': 'Default Disc',
                'circle': 'Circle',
                'square': 'Square',
                'none': 'No Bullets',
            },
            command: 'insertUnorderedList',
        },
        ol: {
            tooltip: 'Ordered List',
            list: {
                'decimal': 'Decimal',
                'lower-alpha': 'Lower Alpha (a, b, c)',
                'upper-alpha': 'Upper Alpha (A, B, C)',
                'lower-roman': 'Lower Roman (i, ii, iii)',
                'upper-roman': 'Upper Roman (I, II, III)',
            },
            command: 'insertOrderedList',
        },
    },
    toolbarSticky: false,
    showXPathInStatusbar: false,
    showCharsCounter: true,
    showWordsCounter: true,
};

export default config;
