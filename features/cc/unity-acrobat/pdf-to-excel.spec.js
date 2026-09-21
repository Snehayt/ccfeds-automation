const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-PdfToExcel',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PdfToExcel-UI',
      path: '/acrobat/online/pdf-to-excel.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-excel @cc-acrobat-pdf-to-excel-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PdfToExcel-Upload',
      path: '/acrobat/online/pdf-to-excel.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-excel @cc-acrobat-pdf-to-excel-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PdfToExcel-Splash',
      path: '/acrobat/online/pdf-to-excel.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-excel @cc-acrobat-pdf-to-excel-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PdfToExcel-Redirect',
      path: '/acrobat/online/pdf-to-excel.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-pdf-to-excel @cc-acrobat-pdf-to-excel-redirect',
    },
  ],
};
