const SAMPLE_FILE = 'assets/sample-testfile.pdf';

module.exports = {
  name: 'CC-Acrobat-RearrangePdf',
  features: [
    {
      tcid: '0',
      name: '@CC-Acrobat-RearrangePdf-UI',
      path: '/acrobat/online/rearrange-pdf.html?georouting=off',
      tags: '@cc @cc-acrobat @cc-acrobat-rearrange-pdf @cc-acrobat-rearrange-pdf-ui',
    },
    {
      tcid: '1',
      name: '@CC-Acrobat-RearrangePdf-Upload',
      path: '/acrobat/online/rearrange-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-rearrange-pdf @cc-acrobat-rearrange-pdf-upload',
    },
    {
      tcid: '2',
      name: '@CC-Acrobat-RearrangePdf-Splash',
      path: '/acrobat/online/rearrange-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-rearrange-pdf @cc-acrobat-rearrange-pdf-splash',
    },
    {
      tcid: '3',
      name: '@CC-Acrobat-RearrangePdf-Redirect',
      path: '/acrobat/online/rearrange-pdf.html?georouting=off',
      data: { file: SAMPLE_FILE },
      tags: '@cc @cc-acrobat @cc-acrobat-rearrange-pdf @cc-acrobat-rearrange-pdf-redirect',
    },
  ],
};
