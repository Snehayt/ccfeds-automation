const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-CompressPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-CompressPdf-UI',
      path: '/acrobat/online/compress-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-compress-pdf @cc-acrobat-compress-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-CompressPdf-Upload',
      path: '/acrobat/online/compress-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-compress-pdf @cc-acrobat-compress-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-CompressPdf-Splash',
      path: '/acrobat/online/compress-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-compress-pdf @cc-acrobat-compress-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-CompressPdf-Redirect',
      path: '/acrobat/online/compress-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-compress-pdf @cc-acrobat-compress-pdf-redirect',
    },
  ],
};
