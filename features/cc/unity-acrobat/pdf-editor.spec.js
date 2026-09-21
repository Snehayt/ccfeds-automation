const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfEditor',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfEditor-UI',
      path: '/acrobat/online/pdf-editor.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-editor @cc-acrobat-pdf-editor-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfEditor-Upload',
      path: '/acrobat/online/pdf-editor.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-editor @cc-acrobat-pdf-editor-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfEditor-Splash',
      path: '/acrobat/online/pdf-editor.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-editor @cc-acrobat-pdf-editor-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfEditor-Redirect',
      path: '/acrobat/online/pdf-editor.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-editor @cc-acrobat-pdf-editor-redirect',
    },
  ],
};
