const SAMPLE_FILE = 'assets/testexcel.xlsx';

module.exports = {
  name: 'CC-Acrobat-ExcelToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-ExcelToPdf-UI',
      path: '/acrobat/online/excel-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-excel-to-pdf @cc-acrobat-excel-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-ExcelToPdf-Upload',
      path: '/acrobat/online/excel-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-excel-to-pdf @cc-acrobat-excel-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-ExcelToPdf-Splash',
      path: '/acrobat/online/excel-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-excel-to-pdf @cc-acrobat-excel-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-ExcelToPdf-Redirect',
      path: '/acrobat/online/excel-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-excel-to-pdf @cc-acrobat-excel-to-pdf-redirect',
    },
  ],
};
