const SAMPLE_FILE = 'assets/testjpg.jpg';

module.exports = {
  name: 'CC-Acrobat-ImageToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-ImageToPdf-UI',
      path: '/acrobat/online/image-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-image-to-pdf @cc-acrobat-image-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-ImageToPdf-Upload',
      path: '/acrobat/online/image-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-image-to-pdf @cc-acrobat-image-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-ImageToPdf-Splash',
      path: '/acrobat/online/image-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-image-to-pdf @cc-acrobat-image-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-ImageToPdf-Redirect',
      path: '/acrobat/online/image-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-image-to-pdf @cc-acrobat-image-to-pdf-redirect',
    },
  ],
};
