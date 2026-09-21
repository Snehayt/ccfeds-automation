const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-OcrPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-OcrPdf-UI',
      path: '/acrobat/online/ocr-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-ocr-pdf @cc-acrobat-ocr-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-OcrPdf-Upload',
      path: '/acrobat/online/ocr-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ocr-pdf @cc-acrobat-ocr-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-OcrPdf-Splash',
      path: '/acrobat/online/ocr-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ocr-pdf @cc-acrobat-ocr-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-OcrPdf-Redirect',
      path: '/acrobat/online/ocr-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-ocr-pdf @cc-acrobat-ocr-pdf-redirect',
    },
  ],
};
