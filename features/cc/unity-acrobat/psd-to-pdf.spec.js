const SAMPLE_FILE = 'assets/samplePSD.psd';

module.exports = {
  name: 'CC-Acrobat-PsdToPdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-PsdToPdf-UI',
      path: '/acrobat/online/psd-to-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-psd-to-pdf @cc-acrobat-psd-to-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-PsdToPdf-Upload',
      path: '/acrobat/online/psd-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-psd-to-pdf @cc-acrobat-psd-to-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-PsdToPdf-Splash',
      path: '/acrobat/online/psd-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-psd-to-pdf @cc-acrobat-psd-to-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-PsdToPdf-Redirect',
      path: '/acrobat/online/psd-to-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-psd-to-pdf @cc-acrobat-psd-to-pdf-redirect',
    },
  ],
};
