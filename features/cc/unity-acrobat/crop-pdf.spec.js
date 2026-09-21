const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-CropPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-CropPdf-UI',
      path: '/acrobat/online/crop-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-crop-pdf @cc-acrobat-crop-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-CropPdf-Upload',
      path: '/acrobat/online/crop-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-crop-pdf @cc-acrobat-crop-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-CropPdf-Splash',
      path: '/acrobat/online/crop-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-crop-pdf @cc-acrobat-crop-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-CropPdf-Redirect',
      path: '/acrobat/online/crop-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-crop-pdf @cc-acrobat-crop-pdf-redirect',
    },
  ],
};
