const SAMPLE_FILE = 'assets/sampletiff.tiff';

module.exports = {
  name: 'CC-Acrobat-TiffToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-TiffToPdf-UI',
      path: '/acrobat/online/tiff-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-tiff-to-pdf @cc-acrobat-tiff-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-TiffToPdf-Upload',
      path: '/acrobat/online/tiff-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-tiff-to-pdf @cc-acrobat-tiff-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-TiffToPdf-Splash',
      path: '/acrobat/online/tiff-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-tiff-to-pdf @cc-acrobat-tiff-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-TiffToPdf-Redirect',
      path: '/acrobat/online/tiff-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-tiff-to-pdf @cc-acrobat-tiff-to-pdf-redirect',
    },
  ],
};
