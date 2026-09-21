const SAMPLE_FILE = 'assets/testppt.pptx';

module.exports = {
  name: 'CC-Acrobat-PptToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PptToPdf-UI',
      path: '/acrobat/online/ppt-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-ppt-to-pdf @cc-acrobat-ppt-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PptToPdf-Upload',
      path: '/acrobat/online/ppt-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ppt-to-pdf @cc-acrobat-ppt-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PptToPdf-Splash',
      path: '/acrobat/online/ppt-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ppt-to-pdf @cc-acrobat-ppt-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PptToPdf-Redirect',
      path: '/acrobat/online/ppt-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ppt-to-pdf @cc-acrobat-ppt-to-pdf-redirect',
    },
  ],
};
