const SAMPLE_FILE = 'assets/testdocument.docx';

module.exports = {
  name: 'CC-Acrobat-ConvertPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-ConvertPdf-UI',
      path: '/acrobat/online/convert-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-convert-pdf @cc-acrobat-convert-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-ConvertPdf-Upload',
      path: '/acrobat/online/convert-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-convert-pdf @cc-acrobat-convert-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-ConvertPdf-Splash',
      path: '/acrobat/online/convert-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-convert-pdf @cc-acrobat-convert-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-ConvertPdf-Redirect',
      path: '/acrobat/online/convert-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-convert-pdf @cc-acrobat-convert-pdf-redirect',
    },
  ],
};
