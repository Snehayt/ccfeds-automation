const SAMPLE_FILE = 'assets/testgif.gif';

module.exports = {
  name: 'CC-Acrobat-GifToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-GifToPdf-UI',
      path: '/acrobat/online/gif-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-gif-to-pdf @cc-acrobat-gif-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-GifToPdf-Upload',
      path: '/acrobat/online/gif-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-gif-to-pdf @cc-acrobat-gif-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-GifToPdf-Splash',
      path: '/acrobat/online/gif-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-gif-to-pdf @cc-acrobat-gif-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-GifToPdf-Redirect',
      path: '/acrobat/online/gif-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-gif-to-pdf @cc-acrobat-gif-to-pdf-redirect',
    },
  ],
};
